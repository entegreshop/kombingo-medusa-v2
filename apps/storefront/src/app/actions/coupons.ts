"use server"

import { Pool } from "pg"
import { unstable_noStore as noStore } from "next/cache"

export async function getGlobalCoupons() {
  noStore();
  try {
    const pool = new Pool({
      connectionString: 'postgres://postgres@localhost:5432/medusa'
    })
    
    // We fetch promotions that are NOT automatic (meaning they are manual coupons)
    // and don't have item-specific target rules (or we can just fetch all standard ones)
    // In Medusa, standard manual promotions are exactly what we want.
    const res = await pool.query(`
      SELECT 
        p.code, 
        p.is_automatic,
        pm.type, 
        pm.value, 
        pm.currency_code,
        p.metadata
      FROM promotion p
      JOIN promotion_application_method pm ON p.id = pm.promotion_id
      WHERE p.type = 'standard' 
      AND p.is_automatic = false
      AND p.status = 'active'
      AND p.deleted_at IS NULL
    `);
    
    await pool.end();
    
    return res.rows.map((row: any) => ({
      code: row.code,
      type: row.type === 'percentage' ? 'percent' : 'fixed',
      amount: row.type === 'percentage' ? row.value : Number(row.value) / 100,
      isGlobal: true, // to distinguish from product-specific coupons
      metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata || {})
    }));
  } catch (e) {
    console.error("Error fetching global coupons:", e);
    return [];
  }
}

export async function getCartSpecialOffersIds() {
  noStore();
  try {
    const pool = new Pool({
      connectionString: 'postgres://postgres@localhost:5432/medusa'
    });
    
    const res = await pool.query(`
      SELECT id, metadata
      FROM product 
      WHERE metadata->'coupon_badge'->>'active' = 'true'
      AND status = 'published'
      AND deleted_at IS NULL
      LIMIT 10
    `);
    
    await pool.end();
    
    return res.rows.map(r => ({
      id: r.id,
      metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata) : (r.metadata || {})
    }));
  } catch (e) {
    console.error("Error fetching cart special offers ids:", e);
    return [];
  }
}

