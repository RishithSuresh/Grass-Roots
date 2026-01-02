const http = require('http');

const data = JSON.stringify({ crop: 'Tomato', location: 'Bangalore', currentPrice: 3500 });

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/ml/predict',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => { body += chunk.toString(); });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', (err) => {
  console.error('Request error:', err.message);
});

req.write(data);
req.end();
