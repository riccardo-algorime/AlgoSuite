// Use import for node-fetch v3
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testDirectRegistration() {
  console.log('Testing registration with direct API calls...\n');

  // Generate random email to avoid unique constraint violations
  const randomSuffix = Math.floor(Math.random() * 10000);
  const email = `direct_test_${randomSuffix}@example.com`;

  // Test with direct curl-like request
  try {
    console.log(`Using email: ${email}`);
    
    // Create the request body exactly as needed
    const requestBody = {
      email: email,
      password: 'Password123',
      firstName: 'Jane',
      lastName: 'Smith'
    };
    
    console.log(`Request body: ${JSON.stringify(requestBody)}`);
    
    // Make the request with detailed logging
    console.log('Making request to: http://localhost:8000/api/v1/auth/register');
    const response = await fetch('http://localhost:8000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Log all response details
    console.log(`Status: ${response.status}`);
    console.log(`Status Text: ${response.statusText}`);
    console.log('Response Headers:');
    response.headers.forEach((value, name) => {
      console.log(`  ${name}: ${value}`);
    });
    
    // Get response body
    const responseText = await response.text();
    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log(`Response Body (JSON): ${JSON.stringify(responseData, null, 2)}`);
    } catch (e) {
      console.log(`Response Body (Text): ${responseText}`);
    }
    
    if (response.status === 201) {
      console.log('\nRegistration SUCCESSFUL! ✅');
    } else {
      console.log('\nRegistration FAILED! ❌');
    }
  } catch (error) {
    console.error('Error in test:', error);
  }
}

testDirectRegistration();
