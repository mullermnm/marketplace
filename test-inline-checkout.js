// Test script to verify inline checkout works
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

const { Paddle, Environment } = require('@paddle/paddle-node-sdk');

async function testInlineCheckout() {
  console.log('Testing inline checkout API...');
  
  const client = new Paddle(process.env.PADDLE_API_KEY, {
    environment: process.env.PADDLE_ENV === 'production' ? Environment.production : Environment.sandbox,
  });

  try {
    // Test creating an inline checkout transaction
    const tx = await client.transactions.create({
      items: [{
        quantity: 1,
        price: {
          description: "Test Product for Inline Checkout",
          name: "Test Product for Inline Checkout",
          unitPrice: { amount: "1500", currencyCode: "USD" },
          quantity: { minimum: 1, maximum: 1 },
          taxMode: "account_setting",
          product: {
            name: "Test Product for Inline Checkout",
            taxCategory: "standard",
          },
        },
      }],
      customerEmail: "test@example.com",
      customData: {
        userId: "test-user-inline",
        cart: JSON.stringify([{
          type: "product",
          id: "test-product-inline",
          sellerId: "test-seller",
          priceCents: 1500,
          title: "Test Product for Inline Checkout",
          contains: []
        }])
      },
      collectionMode: "automatic",
    });

    console.log('✓ Inline checkout transaction created successfully!');
    console.log('Transaction ID:', tx.id);
    console.log('Status:', tx.status);
    console.log('Items:', tx.items?.length || 0);
    
    // Extract price IDs for inline checkout
    const items = (tx.items || []).map(item => ({
      priceId: item.price.id,
      quantity: item.quantity,
    }));
    
    console.log('Price IDs for inline checkout:', items);
    
    return { transactionId: tx.id, items };
  } catch (error) {
    console.error('✗ Error creating inline checkout:', error);
    console.error('Error details:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    return null;
  }
}

testInlineCheckout().then(result => {
  console.log(result ? '✓ Inline checkout test passed!' : '✗ Inline checkout test failed!');
  process.exit(result ? 0 : 1);
});