const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres@localhost:5432/medusa'
});

async function main() {
  await client.connect();
  console.log('Connected to PG');

  // Query regions
  const regions = await client.query('SELECT id, name, currency_code FROM region');
  console.log('Regions:', regions.rows);

  // Query shipping options
  try {
    const shippingOptions = await client.query(`
      SELECT id, name, price_type, amount, is_tax_inclusive 
      FROM shipping_option
    `);
    console.log('Shipping Options:', shippingOptions.rows);
  } catch (e) {
    console.log('Error querying shipping_option:', e.message);
  }

  // Query active carts
  try {
    const carts = await client.query(`
      SELECT id, email, region_id, total, subtotal, tax_total 
      FROM cart 
      ORDER BY created_at DESC 
      LIMIT 3
    `);
    console.log('Recent Carts:', carts.rows);
  } catch (e) {
    console.log('Error querying cart:', e.message);
  }

  // Query payment providers / sessions
  try {
    const paymentCollections = await client.query(`
      SELECT id, cart_id, amount, status 
      FROM payment_collection 
      LIMIT 3
    `);
    console.log('Payment Collections:', paymentCollections.rows);
  } catch (e) {
    console.log('Error querying payment_collection:', e.message);
  }

  await client.end();
}

main().catch(console.error);
