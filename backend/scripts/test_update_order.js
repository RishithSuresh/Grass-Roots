const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { promisePool } = require('../config/database');

async function testUpdate() {
  try {
    console.log('Testing order update...\n');
    
    // First, get an order
    const [orders] = await promisePool.query('SELECT order_id FROM orders LIMIT 1');
    if (orders.length === 0) {
      console.log('No orders found');
      process.exit(1);
    }
    
    const orderId = orders[0].order_id;
    console.log('Testing with order ID:', orderId);
    
    // Try to update it
    const sql = 'UPDATE orders SET order_status = ? WHERE order_id = ?';
    console.log('SQL:', sql);
    console.log('Values:', ['confirmed', orderId]);
    
    const [result] = await promisePool.query(sql, ['confirmed', orderId]);
    
    console.log('\n✅ Success!');
    console.log('Affected rows:', result.affectedRows);
    
    // Verify the update
    const [updated] = await promisePool.query('SELECT order_status FROM orders WHERE order_id = ?', [orderId]);
    console.log('New status:', updated[0].order_status);
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

testUpdate();

