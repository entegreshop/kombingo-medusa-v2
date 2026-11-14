const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres@localhost:5432/medusa'
});

async function main() {
  await client.connect();
  console.log('Connected to PG');

  // Query prices for each shipping option
  const res = await client.query(`
    SELECT 
      so.id as shipping_option_id,
      so.name as shipping_option_name,
      sops.price_set_id,
      p.id as price_id,
      p.currency_code,
      p.amount
    FROM shipping_option so
    LEFT JOIN shipping_option_price_set sops ON sops.shipping_option_id = so.id
    LEFT JOIN price p ON p.price_set_id = sops.price_set_id;
  `);
  
  console.log('Shipping Option Prices:');
  console.log(res.rows);

  await client.end();
}

main().catch(console.error);
