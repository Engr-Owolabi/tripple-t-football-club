// seed-config.js - Add initial 7 players to MongoDB Atlas cloud database
// Uses config.js - SINGLE PLACE for credentials!

const mongoose = require('mongoose');
const config = require('./config');
const Player = require('./models/Player');

const initialSquad = [
  { name: 'Owolabi', age: 20, position: 'Striker', jersey: 9, goals: 9, assist: 5, salary: 500000 },
  { name: 'Uncle Tope', age: 17, position: 'Goalkeeper', jersey: 8, goals: 1, assist: 0, salary: 250000 },
  { name: 'Olaseni', age: 19, position: 'Defender', jersey: 5, goals: 2, assist: 3, salary: 350000 },
  { name: 'Alexander', age: 16, position: 'Striker', jersey: 1, goals: 6, assist: 4, salary: 450000 },
  { name: 'Femi', age: 22, position: 'Winger', jersey: 7, goals: 4, assist: 6, salary: 380000 },
  { name: 'Debola', age: 15, position: 'Midfielder', jersey: 10, goals: 4, assist: 3, salary: 390000 },
  { name: 'Fela', age: 18, position: 'Defender', jersey: 3, goals: 3, assist: 2, salary: 300000 }
];

async function seed() {
  try {
    console.log('=== Seeding MongoDB Atlas ===');
    console.log(`Cluster: ${config.CLUSTER}`);
    console.log(`Database: ${config.DB_NAME}`);
    console.log(`Safe URI: ${config.MONGODB_URI.replace(/:.*@/, ':****@')}`);
    
    console.log('\nConnecting to MongoDB Atlas...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✅ Connected!');
    
    console.log('\n🗑️ Clearing existing players...');
    await Player.deleteMany({});
    console.log('✅ Cleared!');
    
    console.log('\n🌱 Adding 7 initial players...');
    const players = await Player.insertMany(initialSquad);
    console.log(`✅ Seeded ${players.length} players to MongoDB Atlas cloud!`);
    
    console.log('\nPlayers added:');
    players.forEach(p => {
      console.log(`- ${p.name}: ${p.goals} goals, ${p.position}, N${p.salary.toLocaleString()}`);
    });
    
    console.log('\n✅ Done! Now run: npm run dev and open http://localhost:3001');
    console.log('You should see 7 players from MongoDB cloud!');
    
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seed error:', err.message);
    console.log('\nFixes:');
    console.log('1. Is config.js correct? Run node test-connection-config.js first');
    console.log('2. Did you create models/Player.js file?');
    console.log('3. Network Access 0.0.0.0/0 Active in Atlas?');
    process.exit(1);
  }
}

seed();
