const fetch = require('node-fetch');

async function test(crop, location) {
  try {
    const res = await fetch('http://localhost:4000/api/ml/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ crop, location })
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Request failed:', err.message);
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const crop = args[0] || 'Tomato';
  const location = args[1] || 'Bangalore';
  test(crop, location);
}
