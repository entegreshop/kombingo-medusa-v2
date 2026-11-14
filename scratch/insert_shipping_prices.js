const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres@localhost:5432/medusa'
});

async function main() {
  await client.connect();
  console.log('Connected to PG');

  // Insert TRY prices for shipping options
  await client.query(`
    INSERT INTO price (id, price_set_id, currency_code, raw_amount, amount, rules_count)
    VALUES 
      ('price_try_standard', 'pset_01KSRCA6WQAPTEXD99EV371B36', 'try', '{"value":"100","precision":20}', '100', 0),
      ('price_try_express', 'pset_01KSRCA6WTDDHRMKDFHR65PBHC', 'try', '{"value":"150","precision":20}', '150', 0)
    ON CONFLICT (id) DO UPDATE SET 
      amount = EXCLUDED.amount, 
      raw_amount = EXCLUDED.raw_amount,
      price_set_id = EXCLUDED.price_set_id,
      currency_code = EXCLUDED.currency_code;
  `);

  console.log('TRY Prices Inserted Successfully!');

  // Verify
  const res = await client.query(`
    SELECT * FROM price WHERE id IN ('price_try_standard', 'price_try_express');
  `);
  console.log('Verified inserted prices:', res.rows);

  await client.end();
}

main().catch(console.error);
