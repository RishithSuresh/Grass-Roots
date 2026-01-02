const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { promisePool } = require('../config/database');

async function testInsert() {
  try {
    console.log('Testing product insert...\n');
    
    const name = 'Test Product';
    const price = 100;
    const stock = 50;
    const description = 'Test description';
    
    const sql = `
      INSERT INTO products
      (retailer_id, product_name, selling_price, quantity_in_stock, description, status, created_at)
      VALUES (1, ?, ?, ?, ?, 'in_stock', NOW())
    `;
    
    console.log('SQL:', sql);
    console.log('Values:', [name, price, stock, description]);
    
    const [result] = await promisePool.query(sql, [name, price, stock, description]);
    
    console.log('\n✅ Success!');
    console.log('Insert ID:', result.insertId);
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

testInsert();

