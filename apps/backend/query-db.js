const { Client } = require('pg');

async function fix() {
  const client = new Client({
    connectionString: 'postgres://postgres@localhost:5432/medusa_v2_ikinci'
  });
  
  await client.connect();
  console.log("Connected");
  
  // See what columns are in product_shipping_profile
  const cols = await client.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'product_shipping_profile'
  `);
  console.log("Columns:", cols.rows.map(r => r.column_name));

  const profileId = 'sp_01KTSXRA2R74VD5YHXMN6GRZDZ';

  // Find all products that DO NOT have a shipping profile linked
  const missingProducts = await client.query(`
    SELECT p.id 
    FROM product p
    LEFT JOIN product_shipping_profile psp ON p.id = psp.product_id
    WHERE psp.shipping_profile_id IS NULL
      AND p.deleted_at IS NULL
  `);
  
  console.log("Products missing shipping profile:", missingProducts.rowCount);

  if (missingProducts.rowCount > 0) {
    for (const row of missingProducts.rows) {
      await client.query(`
        INSERT INTO product_shipping_profile (id, product_id, shipping_profile_id, created_at, updated_at)
        VALUES (md5(random()::text || clock_timestamp()::text), $1, $2, now(), now())
        ON CONFLICT DO NOTHING
      `, [row.id, profileId]);
    }
    console.log("Fixed all missing products!");
  }

  await client.end();
}

fix().catch(console.error);
