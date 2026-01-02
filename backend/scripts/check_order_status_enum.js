const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { promisePool } = require('../config/database');

async function checkEnum() {
  try {
    const [columns] = await promisePool.query(`
      SHOW COLUMNS FROM orders WHERE Field = 'order_status'
    `);
    
    console.log('Order Status Column Info:');
    console.log(columns[0]);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

checkEnum();

