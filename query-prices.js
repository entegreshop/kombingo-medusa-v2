const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgres://postgres@localhost:5432/medusa'
  });

  await client.connect();

  const variantId = 'variant_01KTF29Y3JR9M07C8NJZ613C33';

  console.log("--- Querying Prices for Variant ---");
  const pricesRes = await client.query(`
    SELECT p.id, p.currency_code, p.amount, p.price_set_id
    FROM price p
    JOIN product_variant_price_set pvps ON pvps.price_set_id = p.price_set_id
    WHERE pvps.variant_id = $1;
  `, [variantId]);
  console.log(pricesRes.rows);

  await client.end();
}

main().catch(console.error);
