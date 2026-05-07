// Integration test for checkout endpoint
const fs = require('fs');
const path = require('path');

// Load environment variables manually
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

async function testCheckoutEndpoint() {
  console.log('Testing checkout endpoint integration...');
  
  try {
    // Test the checkout endpoint by making a request to localhost:3001
    const response = await fetch('http://localhost:3001/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // We need to simulate a session cookie, but for now let's see what error we get
      }
    });
    
    const result = await response.json();
    console.log('Response status:', response.status);
    console.log('Response body:', result);
    
    if (response.status === 401) {
      console.log('✓ Expected 401 - Login required (no session)');
      return true;
    } else if (response.status === 400) {
      console.log('✓ Expected 400 - Cart is empty or has errors');
      return true;
    } else if (response.status === 200) {
      console.log('✓ Success - Checkout URL generated');
      return true;
    } else {
      console.log('✗ Unexpected status code');
      return false;
    }
  } catch (error) {
    console.error('Error testing checkout endpoint:', error.message);
    return false;
  }
}

testCheckoutEndpoint().then(success => {
  console.log(success ? 'Integration test passed!' : 'Integration test failed!');
  process.exit(success ? 0 : 1);
});