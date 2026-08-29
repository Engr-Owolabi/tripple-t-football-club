// Test Auth - Simple Version - No curl needed!
// Uses fetch like frontend does - Easy!

// HOW TO RUN:
// Terminal 1: npm run dev (keep server running at http://localhost:3001)
// Terminal 2: node test-auth-simple.js

async function testAuth() {
  console.log('=== Testing Tripple T Auth ===\n');

  // Test 1: Register as Coach
  console.log('1. Registering as Coach Owolabi...');
  try {
    const registerRes = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Coach Owolabi',
        email: 'coach@tripplet.com',
        password: '123456'
      })
    });
    
    const registerData = await registerRes.json();
    
    if (registerRes.ok) {
      console.log('✅ Register Success!');
      console.log(`   Message: ${registerData.message}`);
      console.log(`   Coach: ${registerData.user.name} (${registerData.user.email})`);
      console.log(`   Token: ${registerData.token.slice(0, 20)}... (first 20 chars)`);
    } else {
      console.log('⚠️ Register failed (maybe already registered):', registerData.error);
      console.log('   Trying to login instead...');
    }
  } catch (err) {
    console.log('❌ Register error:', err.message);
  }

  // Test 2: Login as Coach
  console.log('\n2. Logging in as Coach...');
  let token = '';
  try {
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'coach@tripplet.com',
        password: '123456'
      })
    });
    
    const loginData = await loginRes.json();
    
    if (loginRes.ok) {
      console.log('✅ Login Success!');
      console.log(`   Message: ${loginData.message}`);
      console.log(`   Coach: ${loginData.user.name}`);
      token = loginData.token;
      console.log(`   Token saved: ${token.slice(0, 20)}...`);
    } else {
      console.log('❌ Login failed:', loginData.error);
      return;
    }
  } catch (err) {
    console.log('❌ Login error:', err.message);
    return;
  }

  // Test 3: Try to add player WITHOUT token (should fail 401)
  console.log('\n3. Trying to add player WITHOUT token (should fail 401)...');
  try {
    const noTokenRes = await fetch('http://localhost:3001/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'TestNoAuth',
        age: 20,
        position: 'Striker'
      })
    });
    
    const noTokenData = await noTokenRes.json();
    
    if (noTokenRes.status === 401) {
      console.log('✅ Correctly blocked! Status 401 - Not authorized, no token!');
      console.log(`   Message: ${noTokenData.error}`);
    } else {
      console.log('❌ Should have failed 401 but got:', noTokenRes.status, noTokenData);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }

  // Test 4: Try to add player WITH token (should succeed)
  console.log('\n4. Trying to add player WITH token (should succeed)...');
  try {
    const withTokenRes = await fetch('http://localhost:3001/api/players', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'TestWithAuth',
        age: 20,
        position: 'Striker',
        jersey: 99,
        goals: 5,
        assist: 2,
        salary: 300000
      })
    });
    
    const withTokenData = await withTokenRes.json();
    
    if (withTokenRes.ok) {
      console.log('✅ Correctly allowed with token! Player added!');
      console.log(`   Message: ${withTokenData.message}`);
      console.log(`   Player: ${withTokenData.player.name} (ID: ${withTokenData.player._id || withTokenData.player.id})`);
      console.log(`   Total players now: ${withTokenData.totalPlayers}`);
    } else {
      console.log('❌ Should have succeeded but failed:', withTokenRes.status, withTokenData);
    }
  } catch (err) {
    console.log('❌ Error:', err.message);
  }

  console.log('\n=== Auth Test Complete ===');
  console.log('\nWhat you learned:');
  console.log('- Register creates coach account and gives token (wristband)');
  console.log('- Login gives token if email/password correct');
  console.log('- Without token, POST /api/players fails 401 (protected!)');
  console.log('- With token, POST succeeds (wristband allows VIP access!)');
  console.log('\nNext: Push to GitHub and update Render with JWT_SECRET!');
}

testAuth();
