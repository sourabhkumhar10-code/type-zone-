const http = require('http');

console.log('🧪 Testing Login System\n');

// Test 1: Try to login with existing user
const loginData = JSON.stringify({
  username: 'testuser',
  password: 'testpassword123'
});

const loginReq = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': loginData.length
  }
}, (res) => {
  console.log(`Login API Status: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
    
    if (res.statusCode === 200) {
      console.log('\n✅ Login is working!');
    } else {
      console.log('\n❌ Login failed');
    }
  });
});

loginReq.on('error', (e) => {
  console.log(`❌ Error: ${e.message}`);
});

loginReq.write(loginData);
loginReq.end();
