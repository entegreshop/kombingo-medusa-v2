import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
) {
  try {
    const knex = req.scope.resolve("pgConnection") as any

    // Get default shipping profile
    const profileRes = await knex.raw(`SELECT id FROM shipping_profile WHERE type = 'default' LIMIT 1`)
    if (profileRes.rowCount === 0) {
      return res.status(404).json({ error: "No default shipping profile found" })
    }
    const profileId = profileRes.rows[0].id

    // Find products without a shipping profile
    const missingProducts = await knex.raw(`
      SELECT p.id 
      FROM product p
      LEFT JOIN product_shipping_profile psp ON p.id = psp.product_id
      WHERE psp.shipping_profile_id IS NULL
        AND p.deleted_at IS NULL
    `)

    let fixedCount = 0
    if (missingProducts.rowCount > 0) {
      for (const row of missingProducts.rows) {
        await knex.raw(`
          INSERT INTO product_shipping_profile (id, product_id, shipping_profile_id, created_at, updated_at)
          VALUES (md5(random()::text || clock_timestamp()::text), ?, ?, now(), now())
          ON CONFLICT DO NOTHING
        `, [row.id, profileId])
        fixedCount++
      }
    }

    return res.json({ 
      success: true, 
      message: `Fixed ${fixedCount} products by assigning them to default shipping profile ${profileId}.` 
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message, stack: error.stack })
  }
}
