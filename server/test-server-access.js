const http = require('http');

console.log('Testing server at http://localhost:3001\n');

// Test 1: Health check
http.get('http://localhost:3001/api/health', (res) => {
  console.log(`1. API Health Check: ${res.statusCode}`);
}).on('error', (e) => {
  console.log(`1. API Health Check: FAILED - ${e.message}`);
});

// Test 2: Forgot.html
http.get('http://localhost:3001/forgot.html', (res) => {
  console.log(`2. GET /forgot.html: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    if (data.includes('Forgot Password')) {
      console.log('   ✅ forgot.html content loaded successfully!');
    } else {
      console.log('   ⚠️ Response received but does not contain "Forgot Password"');
      console.log('   First 200 chars:', data.substring(0, 200));
    }
  });
}).on('error', (e) => {
  console.log(`2. GET /forgot.html: FAILED - ${e.message}`);
});

// Test 3: Root path
http.get('http://localhost:3001/', (res) => {
  console.log(`3. GET /: ${res.statusCode}`);
}).on('error', (e) => {
  console.log(`3. GET /: FAILED - ${e.message}`);
});
