const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const BASE_URL = 'http://localhost:4000';

async function testEndpoint(method, url, body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    
    const response = await fetch(BASE_URL + url, options);
    const data = await response.json();
    
    return {
      success: response.ok,
      status: response.status,
      data
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
}

async function runTests() {
  console.log('🧪 Testing All Retailer Endpoints\n');
  console.log('='.repeat(60));
  
  // Test 1: GET Products
  console.log('\n1️⃣  Testing GET /api/products');
  const products = await testEndpoint('GET', '/api/products');
  if (products.success) {
    console.log('   ✅ Success! Found', products.data.length, 'products');
    console.log('   Sample:', products.data[0]?.name || 'No products');
  } else {
    console.log('   ❌ Failed:', products.error || products.data.error);
  }
  
  // Test 2: POST Product
  console.log('\n2️⃣  Testing POST /api/products');
  const newProduct = await testEndpoint('POST', '/api/products', {
    name: 'Test Tomato',
    price: 50,
    stock: 100,
    description: 'Fresh tomatoes for testing'
  });
  if (newProduct.success) {
    console.log('   ✅ Success! Created product ID:', newProduct.data.id);
  } else {
    console.log('   ❌ Failed:', newProduct.error || newProduct.data.error);
  }
  
  // Test 3: GET Orders
  console.log('\n3️⃣  Testing GET /api/orders');
  const orders = await testEndpoint('GET', '/api/orders');
  if (orders.success) {
    console.log('   ✅ Success! Found', orders.data.length, 'orders');
    if (orders.data.length > 0) {
      const order = orders.data[0];
      console.log('   Sample order:', order.id || order.orderNumber);
      console.log('   Items:', order.items?.length || 0);
    }
  } else {
    console.log('   ❌ Failed:', orders.error || orders.data.error);
  }
  
  // Test 4: POST Order
  console.log('\n4️⃣  Testing POST /api/orders');
  const newOrder = await testEndpoint('POST', '/api/orders', {
    id: 'test_' + Date.now(),
    items: [
      { productId: 1, name: 'Test Product', qty: 2, price: 50 }
    ],
    total: 100,
    status: 'pending',
    paid: false
  });
  if (newOrder.success) {
    console.log('   ✅ Success! Created order ID:', newOrder.data.id);
  } else {
    console.log('   ❌ Failed:', newOrder.error || newOrder.data.error);
  }
  
  // Test 5: PUT Order (update status)
  if (orders.success && orders.data.length > 0) {
    // Find a database order (has numeric id)
    const dbOrder = orders.data.find(o => typeof o.id === 'number') || orders.data[0];
    const orderId = dbOrder.id;
    console.log('\n5️⃣  Testing PUT /api/orders/' + orderId);
    const updateOrder = await testEndpoint('PUT', `/api/orders/${orderId}`, {
      status: 'confirmed'
    });
    if (updateOrder.success) {
      console.log('   ✅ Success! Updated order status');
    } else {
      console.log('   ❌ Failed:', updateOrder.error || updateOrder.data.error);
    }
  }

  // Test 6: GET Single Order
  if (orders.success && orders.data.length > 0) {
    const dbOrder = orders.data.find(o => typeof o.id === 'number') || orders.data[0];
    const orderId = dbOrder.id;
    console.log('\n6️⃣  Testing GET /api/orders/' + orderId);
    const singleOrder = await testEndpoint('GET', `/api/orders/${orderId}`);
    if (singleOrder.success) {
      console.log('   ✅ Success! Retrieved order details');
      console.log('   Items:', singleOrder.data.items?.length || 0);
    } else {
      console.log('   ❌ Failed:', singleOrder.error || singleOrder.data.error);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ All tests completed!\n');
}

runTests().catch(console.error);

