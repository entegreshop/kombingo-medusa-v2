const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/kombingo'
});

async function main() {
  try {
    const res = await pool.query('SELECT id, name, handle, is_active, is_internal FROM product_category');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

main();
