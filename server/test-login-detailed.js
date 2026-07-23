const http = require('http');

console.log('\n🔐 TESTING LOGIN SYSTEM\n');

// Test credentials - try different users
const testUsers = [
  { username: 'testuser', password: 'testpassword123' },
  { username: 'Sourabh@@@', password: 'password123' },
  { username: 'golu', password: 'password123' }
];

async function testLogin(username, password) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({ username, password });
    
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`\nTest: ${username}`);
        console.log(`Status: ${res.statusCode}`);
        
        try {
          const response = JSON.parse(data);
          if (res.statusCode === 200) {
            console.log(`✅ SUCCESS - Token received`);
            console.log(`   User: ${response.user.username}`);
            console.log(`   Email: ${response.user.email}`);
          } else {
            console.log(`❌ FAILED - ${response.error}`);
          }
        } catch (e) {
          console.log(`❌ Parse error: ${data}`);
        }
        
        resolve();
      });
    });
    
    req.on('error', (e) => {
      console.log(`\nTest: ${username}`);
      console.log(`❌ Connection error: ${e.message}`);
      resolve();
    });
    
    req.write(postData);
    req.end();
  });
}

// Run tests
(async () => {
  for (const user of testUsers) {
    await testLogin(user.username, user.password);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('Testing complete!\n');
})();
