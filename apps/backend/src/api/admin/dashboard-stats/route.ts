import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Pool } from "pg"
import { getGaRealtimeStats } from "../pixel-settings/route"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgres://postgres@localhost:5432/medusa_v2_ikinci"
})

function getDateRange(period: string) {
  const now = new Date()
  let start = new Date()
  let end = new Date()

  switch (period) {
    case "Bugün":
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case "Dün":
      start.setDate(now.getDate() - 1)
      start.setHours(0, 0, 0, 0)
      end.setDate(now.getDate() - 1)
      end.setHours(23, 59, 59, 999)
      break
    case "Bu Hafta": {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Monday
      start.setDate(diff)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    }
    case "Geçen Hafta": {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) - 7
      start.setDate(diff)
      start.setHours(0, 0, 0, 0)
      end.setDate(diff + 6)
      end.setHours(23, 59, 59, 999)
      break
    }
    case "Bu Ay":
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case "Geçen Ay":
      start.setMonth(now.getMonth() - 1)
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      
      const lastDayOfPrevMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      end = new Date(now.getFullYear(), now.getMonth() - 1, lastDayOfPrevMonth.getDate(), 23, 59, 59, 999)
      break
    case "Bu Yıl":
      start.setMonth(0, 1)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case "Tüm Zamanlar":
    default:
      start = new Date(2020, 0, 1)
      end.setHours(23, 59, 59, 999)
      break
  }
  return { start, end }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const period = (req.query.period as string) || "Bugün"
    const { start, end } = getDateRange(period)

    // 1. Get real orders count and total sales from DB for this period
    let realOrderCount = 0
    let realTotalRevenue = 0
    let realPendingCount = 0
    let realPreparingCount = 0

    let dbOnayBekleyenCount = 0
    let dbHazirlananCount = 0
    let dbKargolananCount = 0
    let dbTeslimEdilenCount = 0
    let dbIadeEdilenCount = 0
    let dbIptalEdilenCount = 0

    let ordersRes: any
    try {
      ordersRes = await pool.query(`
        SELECT o.id, o.status, o.metadata, o.created_at, 
               os.totals->>'current_order_total' as total,
               f.packed_at, f.shipped_at, f.delivered_at
        FROM "order" o
        LEFT JOIN "order_summary" os ON os.order_id = o.id
        LEFT JOIN (
           SELECT DISTINCT ON (order_id) order_id, fulfillment_id
           FROM order_fulfillment
           WHERE deleted_at IS NULL
           ORDER BY order_id, created_at DESC
        ) ofo ON ofo.order_id = o.id
        LEFT JOIN "fulfillment" f ON f.id = ofo.fulfillment_id AND f.deleted_at IS NULL
        WHERE o.deleted_at IS NULL AND o.status != 'draft'
          AND o.created_at >= $1 
          AND o.created_at <= $2
      `, [start.toISOString(), end.toISOString()])

      if (ordersRes && ordersRes.rows) {
        realOrderCount = ordersRes.rows.length
        ordersRes.rows.forEach((row: any) => {
          const totalCents = parseInt(row.total || "0", 10)
          realTotalRevenue += totalCents / 100

          let orderStatus = "onay_bekleyen"
          if (row.metadata?.delivery_status) {
            orderStatus = row.metadata.delivery_status
          } else if (row.status === "canceled") {
            orderStatus = "iptal_edilen"
          } else if (row.shipped_at) {
            orderStatus = "kargolanan"
          } else if (row.status === "completed" || row.delivered_at) {
            orderStatus = "teslim_edilen"
          } else if (row.packed_at) {
            orderStatus = "hazirlanan"
          }

          if (orderStatus === "onay_bekleyen") {
            dbOnayBekleyenCount++
            realPendingCount++
          } else if (orderStatus === "hazirlanan") {
            dbHazirlananCount++
            realPreparingCount++
          } else if (orderStatus === "kargolanan") {
            dbKargolananCount++
          } else if (orderStatus === "teslim_edilen") {
            dbTeslimEdilenCount++
          } else if (orderStatus === "iade_edilen") {
            dbIadeEdilenCount++
          } else if (orderStatus === "iptal_edilen") {
            dbIptalEdilenCount++
          }
        });
      }
    } catch (dbErr) {
      console.error("Dashboard stats query error (orders):", dbErr)
    }

    // 1b. Get real item quantities and unit prices from DB for this period
    let realItemQuantitySum = 0
    let realUniqueItemsCount = 0
    let realUnitPriceSum = 0
    try {
      const itemsRes = await pool.query(`
        SELECT oi.quantity, oli.unit_price
        FROM order_item oi
        JOIN order_line_item oli ON oli.id = oi.item_id
        JOIN "order" o ON o.id = oi.order_id
        WHERE o.deleted_at IS NULL AND oi.deleted_at IS NULL AND oli.deleted_at IS NULL
          AND o.status != 'draft'
          AND o.created_at >= $1 AND o.created_at <= $2
      `, [start.toISOString(), end.toISOString()])
      
      if (itemsRes && itemsRes.rows) {
        realUniqueItemsCount = itemsRes.rows.length
        itemsRes.rows.forEach((row: any) => {
          const qty = parseInt(row.quantity || "0", 10)
          const price = parseFloat(row.unit_price || "0") / 100
          realItemQuantitySum += qty
          realUnitPriceSum += price * qty
        })
      }
    } catch (dbErr) {
      console.error("Dashboard stats query error (cart summary items):", dbErr)
    }
    // 1c. Get real cart stats from DB for this period
    let realCartsCount = 0
    let realCartsWithEmailCount = 0
    let realCartsWithAddressCount = 0
    try {
      const cartStatsRes = await pool.query(`
        SELECT 
          COUNT(id) as total_carts,
          COUNT(CASE WHEN email IS NOT NULL THEN 1 END) as carts_with_email,
          COUNT(CASE WHEN shipping_address_id IS NOT NULL THEN 1 END) as carts_with_address
        FROM "cart"
        WHERE deleted_at IS NULL
          AND created_at >= $1 AND created_at <= $2
      `, [start.toISOString(), end.toISOString()])

      if (cartStatsRes && cartStatsRes.rows && cartStatsRes.rows[0]) {
        realCartsCount = parseInt(cartStatsRes.rows[0].total_carts || "0", 10)
        realCartsWithEmailCount = parseInt(cartStatsRes.rows[0].carts_with_email || "0", 10)
        realCartsWithAddressCount = parseInt(cartStatsRes.rows[0].carts_with_address || "0", 10)
      }
    } catch (dbErr) {
      console.error("Dashboard stats query error (carts count):", dbErr)
    }

    // 2. Get real best sellers from DB
    let bestSellers: any[] = []
    try {
      const bestSellersRes = await pool.query(`
        SELECT 
          oli.product_title, 
          oli.variant_title, 
          COALESCE(NULLIF(oli.thumbnail, ''), p.thumbnail) as thumbnail, 
          oli.variant_sku as sku, 
          SUM(CAST(oi.quantity AS integer)) as quantity,
          AVG(CAST(oli.unit_price AS numeric)) / 100 as price,
          pv.metadata->>'cost_price' as cost_price
        FROM order_item oi
        JOIN order_line_item oli ON oli.id = oi.item_id
        JOIN "order" o ON o.id = oi.order_id
        LEFT JOIN "product_variant" pv ON pv.id = oli.variant_id
        LEFT JOIN "product" p ON p.id = pv.product_id
        WHERE o.deleted_at IS NULL AND oi.deleted_at IS NULL AND oli.deleted_at IS NULL
          AND o.status != 'draft'
          AND o.created_at >= $1 AND o.created_at <= $2
        GROUP BY oli.product_title, oli.variant_title, oli.thumbnail, p.thumbnail, oli.variant_sku, pv.metadata
        ORDER BY quantity DESC
        LIMIT 10
      `, [start.toISOString(), end.toISOString()])
      if (bestSellersRes && bestSellersRes.rows) {
        bestSellers = bestSellersRes.rows.map((row: any) => {
          const price = parseFloat(row.price || "0")
          const costPrice = parseFloat(row.cost_price || (price * 0.4).toFixed(2))
          return {
            title: row.product_title,
            subtitle: row.variant_title,
            thumbnail: row.thumbnail || "",
            sku: row.sku || "",
            quantity: parseInt(row.quantity, 10),
            price,
            costPrice,
            totalSales: parseInt(row.quantity, 10) * price
          }
        })
      }
    } catch (dbErr) {
      console.error("Dashboard stats query error (best sellers):", dbErr)
    }

    // 3. Get real critical stock levels from DB
    let criticalStocks: any[] = []
    try {
      const stockRes = await pool.query(`
        SELECT 
          pv.title as variant_title,
          p.title as product_title,
          pv.sku,
          p.thumbnail,
          COALESCE(il.stocked_quantity, 0) as stock_quantity
        FROM product_variant pv
        JOIN product p ON p.id = pv.product_id
        LEFT JOIN product_variant_inventory_item pvii ON pvii.variant_id = pv.id
        LEFT JOIN inventory_level il ON il.inventory_item_id = pvii.inventory_item_id AND il.deleted_at IS NULL
        WHERE pv.deleted_at IS NULL AND p.deleted_at IS NULL
        ORDER BY stock_quantity ASC
        LIMIT 5
      `)
      if (stockRes && stockRes.rows) {
        criticalStocks = stockRes.rows
          .map((row: any) => ({
            product_title: row.product_title,
            variant_title: row.variant_title,
            sku: row.sku || "",
            thumbnail: row.thumbnail || "",
            stock: parseInt(row.stock_quantity, 10)
          }))
          .filter((item: any) => item.stock <= 5)
      }
    } catch (dbErr) {
      console.error("Dashboard stats query error (critical stock):", dbErr)
    }

    // 4. Period dynamic chart data and counts
    let mockOffsetRevenue = 0
    let mockOffsetOrders = 0
    let chartLabels: string[] = []
    let chartOrders: number[] = []
    let chartRevenue: number[] = []

    const getOrderTimeInfo = (date: Date) => {
      const trDate = new Date(date.getTime() + (3 * 60 * 60 * 1000))
      return {
        hour: trDate.getUTCHours(),
        day: trDate.getUTCDay(),
        date: trDate.getUTCDate(),
        month: trDate.getUTCMonth() + 1,
        year: trDate.getUTCFullYear()
      }
    }

    if (ordersRes && ordersRes.rows) {
      if (period === "Bugün" || period === "Dün") {
        chartLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
        chartOrders = [0, 0, 0, 0, 0, 0]
        chartRevenue = [0, 0, 0, 0, 0, 0]
        
        ordersRes.rows.forEach((row: any) => {
          const { hour } = getOrderTimeInfo(new Date(row.created_at))
          const idx = Math.floor(hour / 4)
          if (idx >= 0 && idx < 6) {
            chartOrders[idx]++
            chartRevenue[idx] += parseInt(row.total || "0", 10) / 100
          }
        })
      } else if (period === "Bu Hafta" || period === "Geçen Hafta") {
        chartLabels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
        chartOrders = [0, 0, 0, 0, 0, 0, 0]
        chartRevenue = [0, 0, 0, 0, 0, 0, 0]
        
        ordersRes.rows.forEach((row: any) => {
          const { day } = getOrderTimeInfo(new Date(row.created_at))
          const idx = day === 0 ? 6 : day - 1
          if (idx >= 0 && idx < 7) {
            chartOrders[idx]++
            chartRevenue[idx] += parseInt(row.total || "0", 10) / 100
          }
        })
      } else if (period === "Bu Ay" || period === "Geçen Ay") {
        chartLabels = ["1. Hafta", "2. Hafta", "3. Hafta", "4. Hafta"]
        chartOrders = [0, 0, 0, 0]
        chartRevenue = [0, 0, 0, 0]
        
        ordersRes.rows.forEach((row: any) => {
          const { date } = getOrderTimeInfo(new Date(row.created_at))
          let idx = 3
          if (date <= 7) idx = 0
          else if (date <= 14) idx = 1
          else if (date <= 21) idx = 2
          
          chartOrders[idx]++
          chartRevenue[idx] += parseInt(row.total || "0", 10) / 100
        })
      } else if (period === "Bu Yıl") {
        chartLabels = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]
        chartOrders = Array(12).fill(0)
        chartRevenue = Array(12).fill(0)
        
        ordersRes.rows.forEach((row: any) => {
          const { month } = getOrderTimeInfo(new Date(row.created_at))
          const idx = month - 1
          if (idx >= 0 && idx < 12) {
            chartOrders[idx]++
            chartRevenue[idx] += parseInt(row.total || "0", 10) / 100
          }
        })
        
        const currentMonth = new Date().getMonth() + 1
        chartLabels = chartLabels.slice(0, currentMonth).map(m => `${m}.2026`)
        chartOrders = chartOrders.slice(0, currentMonth)
        chartRevenue = chartRevenue.slice(0, currentMonth)
      } else {
        chartLabels = ["2022", "2023", "2024", "2025", "2026"]
        chartOrders = [0, 0, 0, 0, 0]
        chartRevenue = [0, 0, 0, 0, 0]
        
        ordersRes.rows.forEach((row: any) => {
          const { year } = getOrderTimeInfo(new Date(row.created_at))
          const idx = chartLabels.indexOf(year.toString())
          if (idx !== -1) {
            chartOrders[idx]++
            chartRevenue[idx] += parseInt(row.total || "0", 10) / 100
          }
        })
      }
    } else {
      if (period === "Bugün" || period === "Dün") {
        chartLabels = ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"]
        chartOrders = [0, 0, 0, 0, 0, 0]
        chartRevenue = [0, 0, 0, 0, 0, 0]
      } else if (period === "Bu Hafta" || period === "Geçen Hafta") {
        chartLabels = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
        chartOrders = [0, 0, 0, 0, 0, 0, 0]
        chartRevenue = [0, 0, 0, 0, 0, 0, 0]
      } else if (period === "Bu Ay" || period === "Geçen Ay") {
        chartLabels = ["1. Hafta", "2. Hafta", "3. Hafta", "4. Hafta"]
        chartOrders = [0, 0, 0, 0]
        chartRevenue = [0, 0, 0, 0]
      } else if (period === "Bu Yıl") {
        const currentMonth = new Date().getMonth() + 1
        chartLabels = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"].slice(0, currentMonth).map(m => `${m}.2026`)
        chartOrders = Array(currentMonth).fill(0)
        chartRevenue = Array(currentMonth).fill(0)
      } else {
        chartLabels = ["2022", "2023", "2024", "2025", "2026"]
        chartOrders = [0, 0, 0, 0, 0]
        chartRevenue = [0, 0, 0, 0, 0]
      }
    }

    const onayBekleyenCount = dbOnayBekleyenCount
    const hazirlananCount = dbHazirlananCount
    const kargolananCount = dbKargolananCount
    const teslimEdilenCount = dbTeslimEdilenCount
    const iadeEdilenCount = dbIadeEdilenCount

    const totalRevenue = realTotalRevenue
    const totalOrders = realOrderCount

    // Fetch all-time non-draft orders total and count from DB
    let dbAllTimeCount = 0
    let dbAllTimeRevenue = 0
    let daysActive = 1
    try {
      const allTimeRes = await pool.query(`
        SELECT COUNT(o.id) as count, SUM(CAST(os.totals->>'current_order_total' AS numeric)) as total, MIN(o.created_at) as first_order
        FROM "order" o
        LEFT JOIN "order_summary" os ON os.order_id = o.id
        WHERE o.deleted_at IS NULL AND o.status != 'draft'
      `)
      if (allTimeRes && allTimeRes.rows && allTimeRes.rows[0]) {
        dbAllTimeCount = parseInt(allTimeRes.rows[0].count || "0", 10)
        dbAllTimeRevenue = parseFloat(allTimeRes.rows[0].total || "0") / 100
        if (allTimeRes.rows[0].first_order) {
          const firstDate = new Date(allTimeRes.rows[0].first_order)
          const diffTime = Math.abs(Date.now() - firstDate.getTime())
          daysActive = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
          if (daysActive < 1) daysActive = 1
        }
      }
    } catch (dbErr) {
      console.error("Dashboard stats query error (all-time):", dbErr)
    }

    const dailyAvgRevenue = parseFloat((dbAllTimeRevenue / daysActive).toFixed(2))
    const dailyAvgOrders = parseFloat((dbAllTimeCount / daysActive).toFixed(1))
    const weeklyAvgRevenue = parseFloat((dailyAvgRevenue * 7).toFixed(2))
    const weeklyAvgOrders = parseFloat((dailyAvgOrders * 7).toFixed(1))
    const monthlyAvgRevenue = parseFloat((dailyAvgRevenue * 30).toFixed(2))
    const monthlyAvgOrders = parseFloat((dailyAvgOrders * 30).toFixed(1))

    // Calculate cart summary dynamically
    const averageCart = realOrderCount > 0 ? parseFloat((realTotalRevenue / realOrderCount).toFixed(2)) : 0
    const averageQuantityCount = realOrderCount > 0 ? parseFloat((realItemQuantitySum / realOrderCount).toFixed(1)) : 0
    const averageProductCount = realOrderCount > 0 ? parseFloat((realUniqueItemsCount / realOrderCount).toFixed(1)) : 0
    const averagePrice = realItemQuantitySum > 0 ? parseFloat((realUnitPriceSum / realItemQuantitySum).toFixed(2)) : 0

    // No mock best sellers

    // Fetch number of active carts in the last 30 minutes
    let activeCartsCount = 0
    try {
      const cartsRes = await pool.query(`
        SELECT COUNT(id) as count 
        FROM "cart" 
        WHERE updated_at >= NOW() - INTERVAL '30 minutes'
      `)
      if (cartsRes && cartsRes.rows && cartsRes.rows[0]) {
        activeCartsCount = parseInt(cartsRes.rows[0].count || "0", 10)
      }
    } catch (dbErr) {
      console.error("Dashboard stats query error (active carts):", dbErr)
    }

    const gaRealtime = await getGaRealtimeStats(activeCartsCount)
    const activeVisitorsCount = gaRealtime.count
    const desktopPercent = gaRealtime.desktopPercent
    const mobilePercent = gaRealtime.mobilePercent

    let conversionCarts = realCartsCount
    let conversionCheckout = realCartsWithEmailCount
    let conversionAddress = realCartsWithAddressCount

    // Without an anonymous tracking service, we assume carts = visitors.
    const conversionVisitors = Math.max(conversionCarts, totalOrders)
    const conversionOverallRate = conversionVisitors > 0 ? parseFloat(((totalOrders / conversionVisitors) * 100).toFixed(2)) : 0
    const cartsCreatedPercent = conversionVisitors > 0 ? parseFloat(((conversionCarts / conversionVisitors) * 100).toFixed(2)) : 0
    const checkoutInitiatedPercent = conversionVisitors > 0 ? parseFloat(((conversionCheckout / conversionVisitors) * 100).toFixed(2)) : 0
    const addressEnteredPercent = conversionVisitors > 0 ? parseFloat(((conversionAddress / conversionVisitors) * 100).toFixed(2)) : 0

    // Traffic Sources distribution - currently no real data source in standard Medusa DB
    const trafficSources: any[] = []

    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate")
    res.setHeader("Pragma", "no-cache")
    res.setHeader("Expires", "0")
    res.json({
      success: true,
      stats: {
        orders: {
          new: realPendingCount,
          preparing: realPreparingCount,
          onayBekleyen: onayBekleyenCount,
          hazirlanan: hazirlananCount,
          kargolanan: kargolananCount,
          teslimEdilen: teslimEdilenCount,
          iadeEdilen: iadeEdilenCount,
          circleCount: onayBekleyenCount + iadeEdilenCount,
          channels: [
            { name: "kombingo.com (Web Mağaza)", count: realOrderCount },
            { name: "N11", count: "-" },
            { name: "Hepsiburada", count: "-" },
            { name: "Trendyol", count: "-" }
          ]
        },
        salesPerformance: {
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          totalOrders,
          dailyAvgRevenue,
          dailyAvgOrders,
          weeklyAvgRevenue,
          weeklyAvgOrders,
          monthlyAvgRevenue,
          monthlyAvgOrders
        },
        cartSummary: {
          averageCart,
          averagePrice,
          averageProductCount,
          averageQuantityCount
        },
        activeVisitors: {
          count: activeVisitorsCount,
          desktopPercent,
          mobilePercent,
          source: gaRealtime.source,
          sessions: gaRealtime.sessions,
          minuteHistory: gaRealtime.minuteHistory,
        },
        conversionRates: {
          overallRate: conversionOverallRate,
          visitors: conversionVisitors,
          cartsCreated: conversionCarts,
          cartsCreatedPercent: cartsCreatedPercent,
          checkoutInitiated: conversionCheckout,
          checkoutInitiatedPercent: checkoutInitiatedPercent,
          addressEntered: conversionAddress,
          addressEnteredPercent: addressEnteredPercent,
          sales: totalOrders,
          salesPercent: conversionOverallRate
        },
        bestSellers,
        criticalStocks,
        trafficSources,
        chartData: {
          labels: chartLabels,
          orders: chartOrders,
          revenue: chartRevenue
        }
      }
    })
  } catch (err: any) {
    console.error("Dashboard stats endpoint error:", err)
    res.status(500).json({ success: false, error: err.message })
  }
}
