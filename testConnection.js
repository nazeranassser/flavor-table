const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testConnection() {
  try {
    await pool.connect();
    console.log('✅ Connection successful!');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
