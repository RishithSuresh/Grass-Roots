const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { promisePool } = require('../config/database');

async function checkTables() {
  try {
    console.log('Checking products table structure...\n');
    
    const [columns] = await promisePool.query(`
      SHOW COLUMNS FROM products
    `);
    
    console.log('Products table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Key === 'PRI' ? '[PRIMARY KEY]' : ''}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkTables();

