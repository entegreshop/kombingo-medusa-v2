const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres@localhost:5432/medusa'
});

function generateId() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 26; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return 'regpp_' + result;
}

async function main() {
  await client.connect();
  console.log('Connected to PG');

  const providers = ['pp_paytr_paytr', 'pp_bank-transfer_bank-transfer', 'pp_cash-on-delivery_cash-on-delivery', 'pp_card-on-delivery_card-on-delivery'];
  
  // Query all regions
  const regions = await client.query('SELECT id, name FROM region');
  console.log('Regions:', regions.rows);

  // Associate each provider with every region
  for (const region of regions.rows) {
    for (const provider of providers) {
      try {
        const id = generateId();
        
        // Check if association already exists
        const existsRes = await client.query(`
          SELECT 1 FROM region_payment_provider 
          WHERE region_id = $1 AND payment_provider_id = $2
        `, [region.id, provider]);

        if (existsRes.rows.length === 0) {
          await client.query(`
            INSERT INTO region_payment_provider (id, region_id, payment_provider_id, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW());
          `, [id, region.id, provider]);
          console.log(`Associated ${provider} with region ${region.name} (id: ${id})`);
        } else {
          console.log(`Association already exists for ${provider} in ${region.name}`);
        }
      } catch (e) {
        console.log(`Failed to associate ${provider} with region ${region.name}:`, e.message);
      }
    }
  }

  // Verify
  const associations = await client.query('SELECT * FROM region_payment_provider');
  console.log('Active Associations:', associations.rows);

  await client.end();
}

main().catch(console.error);
