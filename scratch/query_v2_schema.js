const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres@localhost:5432/medusa'
});

async function main() {
  await client.connect();
  console.log('Connected to PG');

  // List all tables in public schema
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE '%shipping%' OR table_name LIKE '%price%' OR table_name LIKE '%cart%';
  `);
  console.log('Tables:', tables.rows.map(r => r.table_name));

  // Inspect columns of shipping_option
  const shippingOptionCols = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'shipping_option';
  `);
  console.log('shipping_option columns:', shippingOptionCols.rows);

  // Inspect shipping options
  const shippingOptions = await client.query(`
    SELECT * FROM shipping_option;
  `);
  console.log('shipping_option records:', shippingOptions.rows);

  // Inspect prices
  try {
    const prices = await client.query(`
      SELECT * FROM price LIMIT 5;
    `);
    console.log('price records:', prices.rows);
  } catch (e) {
    console.log('Error querying price:', e.message);
  }

  await client.end();
}

main().catch(console.error);
