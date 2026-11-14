const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres@localhost:5432/medusa'
});

async function main() {
  await client.connect();
  console.log('Connected to PG');

  // Query payment providers
  try {
    const res = await client.query('SELECT * FROM payment_provider');
    console.log('Payment Providers:', res.rows);
  } catch (e) {
    console.log('Error querying payment_provider:', e.message);
  }

  // Let's also check tables starting with 'payment'
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name LIKE '%payment%';
  `);
  console.log('Payment tables:', tables.rows.map(r => r.table_name));

  await client.end();
}

main().catch(console.error);
