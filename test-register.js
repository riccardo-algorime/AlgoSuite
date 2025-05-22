// Use import for node-fetch v3
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testRegistration() {
  console.log('Testing registration endpoints...\n');

  // Generate random emails to avoid unique constraint violations
  const randomSuffix = Math.floor(Math.random() * 10000);
  const email1 = `test1_${randomSuffix}@example.com`;
  const email2 = `test2_${randomSuffix}@example.com`;
  const email3 = `test3_${randomSuffix}@example.com`;

  // Test 1: Using firstName and lastName with regular endpoint
  try {
    console.log('Test 1: Using firstName and lastName with regular endpoint');
    console.log(`Using email: ${email1}`);
    const response1 = await fetch('http://localhost:8000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email1,
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe'
      }),
    });

    const status1 = response1.status;
    const data1 = await response1.json();
    console.log(`Status: ${status1}`);
    console.log(`Response: ${JSON.stringify(data1)}\n`);
  } catch (error) {
    console.error('Error in Test 1:', error);
  }

  // Test 2: Using full_name with regular endpoint
  try {
    console.log('Test 2: Using full_name with regular endpoint');
    console.log(`Using email: ${email2}`);
    const requestBody = {
      email: email2,
      password: 'Password123',
      full_name: 'Jane Doe'
    };
    console.log(`Request body: ${JSON.stringify(requestBody)}`);
    
    const response2 = await fetch('http://localhost:8000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const status2 = response2.status;
    const responseText = await response2.text();
    let data2;
    try {
      data2 = JSON.parse(responseText);
    } catch (e) {
      data2 = responseText;
    }
    console.log(`Status: ${status2}`);
    console.log(`Response: ${JSON.stringify(data2)}\n`);
  } catch (error) {
    console.error('Error in Test 2:', error);
  }

  // Test 3: Using full_name with special endpoint
  try {
    console.log('Test 3: Using full_name with special endpoint');
    console.log(`Using email: ${email3}`);
    const requestBody = {
      email: email3,
      password: 'Password123',
      full_name: 'Jane Smith'
    };
    console.log(`Request body: ${JSON.stringify(requestBody)}`);
    
    const response3 = await fetch('http://localhost:8000/api/v1/auth/register-fullname', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const status3 = response3.status;
    const responseText = await response3.text();
    let data3;
    try {
      data3 = JSON.parse(responseText);
    } catch (e) {
      data3 = responseText;
    }
    console.log(`Status: ${status3}`);
    console.log(`Response: ${JSON.stringify(data3)}`);
  } catch (error) {
    console.error('Error in Test 3:', error);
  }
}

testRegistration();
