// Test POST - Add new player to Tripple T API
// Run with: node test-post.js (while server.js is running in another terminal!)

async function addPlayer() {
  try {
    const response = await fetch('http://localhost:3000/api/players', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: "Messi",
        age: 20,
        position: "Striker",
        jersey: 10,
        goals: 15,
        assist: 10,
        salary: 1000000
      })
    });

    const data = await response.json();
    console.log("✅ POST Success! Server responded:");
    console.log(JSON.stringify(data, null, 2));

    // Now check if total players increased
    const checkResponse = await fetch('http://localhost:3000/api/players');
    const checkData = await checkResponse.json();
    console.log(`\n📊 Total players now: ${checkData.total}`);
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.log("Is your server running? Run npm run dev in another terminal!");
  }
}

addPlayer();