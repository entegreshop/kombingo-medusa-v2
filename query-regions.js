const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: 'postgres://postgres@localhost:5432/medusa'
  });

  await client.connect();

  console.log("--- Querying Regions ---");
  const regionsRes = await client.query(`
    SELECT id, name, currency_code FROM region;
  `);
  console.log(regionsRes.rows);

  await client.end();
}

main().catch(console.error);
