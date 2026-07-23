// Test Forgot Password System
// Run with: node test-forgot-password.js

const axios = require('axios');

const API_BASE = 'http://localhost:3001/api';

async function testForgotPassword() {
  console.log('\n🧪 Testing Forgot Password System\n');
  console.log('='.repeat(60));

  try {
    // Test 1: Invalid email format
    console.log('\n❌ Test 1: Invalid email format');
    try {
      await axios.post(`${API_BASE}/auth/forgot`, {
        email: 'invalid-email'
      });
      console.log('   FAIL: Should have rejected invalid email');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ PASS: Correctly rejected invalid email');
        console.log(`   Message: ${error.response.data.error}`);
      } else {
        console.log('   FAIL: Wrong error:', error.message);
      }
    }

    // Test 2: Non-existent email (should still return success for security)
    console.log('\n✅ Test 2: Non-existent email (security test)');
    try {
      const response = await axios.post(`${API_BASE}/auth/forgot`, {
        email: 'nonexistent@example.com'
      });
      console.log('   ✅ PASS: Returns generic success message');
      console.log(`   Message: ${response.data.message}`);
    } catch (error) {
      console.log('   FAIL:', error.message);
    }

    // Test 3: Valid email (demo mode)
    console.log('\n📧 Test 3: Valid email - Demo mode');
    try {
      const response = await axios.post(`${API_BASE}/auth/forgot`, {
        email: 'test@example.com'
      });
      console.log('   ✅ Request successful');
      console.log(`   Message: ${response.data.message}`);
      
      if (response.data.demoMode) {
        console.log('   ℹ️  Demo mode detected');
        console.log(`   Token: ${response.data.token}`);
        console.log(`   Reset URL: ${response.data.resetUrl}`);
        
        // Test 4: Use the reset token
        console.log('\n🔑 Test 4: Reset password with token');
        try {
          const resetResponse = await axios.post(`${API_BASE}/auth/reset`, {
            token: response.data.token,
            password: 'newpassword123'
          });
          console.log('   ✅ Password reset successful!');
          console.log(`   User: ${resetResponse.data.user.username}`);
          console.log(`   Token received: ${resetResponse.data.token ? 'Yes' : 'No'}`);
        } catch (resetError) {
          console.log('   ❌ Reset failed:', resetError.response?.data?.error || resetError.message);
        }
      }
    } catch (error) {
      console.log('   FAIL:', error.message);
    }

    // Test 5: Expired/Invalid token
    console.log('\n⏰ Test 5: Invalid token');
    try {
      await axios.post(`${API_BASE}/auth/reset`, {
        token: 'invalid-token-123',
        password: 'newpassword123'
      });
      console.log('   FAIL: Should have rejected invalid token');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ PASS: Correctly rejected invalid token');
        console.log(`   Message: ${error.response.data.error}`);
      } else {
        console.log('   FAIL: Wrong error:', error.message);
      }
    }

    // Test 6: Short password
    console.log('\n🔒 Test 6: Short password validation');
    try {
      // First get a valid token
      const forgotResponse = await axios.post(`${API_BASE}/auth/forgot`, {
        email: 'test@example.com'
      });
      
      if (forgotResponse.data.token) {
        await axios.post(`${API_BASE}/auth/reset`, {
          token: forgotResponse.data.token,
          password: '12345' // Only 5 chars
        });
        console.log('   FAIL: Should have rejected short password');
      }
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('   ✅ PASS: Correctly rejected short password');
        console.log(`   Message: ${error.response.data.error}`);
      } else {
        console.log('   Note:', error.response?.data?.error || error.message);
      }
    }

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.log('\nMake sure the server is running on http://localhost:3001');
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Test suite completed!\n');
}

// Run tests
testForgotPassword();
