const { Client } = require('pg');

async function checkPromotions() {
  const client = new Client({
    connectionString: 'postgres://postgres@localhost:5432/medusa'
  });
  
  await client.connect();
  const res = await client.query('SELECT * FROM promotion');
  console.log('Promotions:', JSON.stringify(res.rows, null, 2));
  
  const rules = await client.query('SELECT * FROM promotion_rule');
  console.log('Promotion Rules:', JSON.stringify(rules.rows, null, 2));

  await client.end();
}

checkPromotions().catch(console.error);
