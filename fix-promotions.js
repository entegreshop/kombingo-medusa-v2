const { Client } = require('pg');

async function fixPromotions() {
  const client = new Client({
    connectionString: 'postgres://postgres@localhost:5432/medusa'
  });
  
  await client.connect();
  
  // Clean all promotions
  await client.query('DELETE FROM promotion');
  console.log('Deleted all old promotions.');

  // Check product metadata
  const res = await client.query('SELECT id, title, metadata FROM product');
  for (const row of res.rows) {
    if (row.metadata && row.metadata.coupon_badge) {
      console.log(`Product ${row.title} has coupon:`, row.metadata.coupon_badge);
      // Clean up metadata
      delete row.metadata.coupon_badge;
      await client.query('UPDATE product SET metadata = $1 WHERE id = $2', [row.metadata, row.id]);
      console.log(`Cleaned coupon metadata from product ${row.title}`);
    }
  }

  await client.end();
}

fixPromotions().catch(console.error);
