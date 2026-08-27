// Tripple T Football Club - API Server
// Run with: npm run dev  OR  node server.js

const express = require('express');
const app = express();
const PORT = 3000;

// Middleware - Lets API understand JSON
app.use(express.json());

// Our database - Same squad from Day 3!
const squad = [
  { id: 1, name: 'Owolabi', age: 20, position: 'Striker', jersey: 9, goals: 9, assist: 5, salary: 500000 },
  { id: 2, name: 'Uncle Tope', age: 17, position: 'Goalkeeper', jersey: 8, goals: 1, assist: 0, salary: 250000 },
  { id: 3, name: 'Olaseni', age: 19, position: 'Defender', jersey: 5, goals: 2, assist: 3, salary: 350000 },
  { id: 4, name: 'Alexander', age: 16, position: 'Striker', jersey: 1, goals: 6, assist: 4, salary: 450000 },
  { id: 5, name: 'Femi', age: 22, position: 'Winger', jersey: 7, goals: 4, assist: 6, salary: 380000 },
  { id: 6, name: 'Debola', age: 15, position: 'Midfielder', jersey: 10, goals: 4, assist: 3, salary: 390000 },
  { id: 7, name: 'Fela', age: 18, position: 'Defender', jersey: 3, goals: 3, assist: 2, salary: 300000 }
];

function canEnterClub(age) {
  return age >= 18;
}

// ROUTE 1: Welcome
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Tripple T Football Club API!',
    endpoints: [
      'GET /api/players',
      'GET /api/players/eligible',
      'GET /api/players/waiting',
      'GET /api/players/top-scorer',
      'GET /api/players/best-assist',
      'GET /api/stats',
      'GET /api/players/:id',
      'POST /api/players'
    ]
  });
});

// ROUTE 2: Get all players
app.get('/api/players', (req, res) => {
  res.json({
    total: squad.length,
    players: squad
  });
});

// ROUTE 3: Get eligible players
app.get('/api/players/eligible', (req, res) => {
  const eligible = squad.filter(p => canEnterClub(p.age));
  res.json({
    total: eligible.length,
    players: eligible
  });
});

// ROUTE 4: Get waiting list with yearsToWait
app.get('/api/players/waiting', (req, res) => {
  const waiting = squad.filter(p => p.age < 18).map(p => ({
    ...p,
    yearsToWait: 18 - p.age,
    willJoinIn: new Date().getFullYear() + (18 - p.age)
  }));
  res.json({
    total: waiting.length,
    players: waiting
  });
});

// ROUTE 5: Get top scorer
app.get('/api/players/top-scorer', (req, res) => {
  const topScorer = squad.reduce((best, p) => p.goals > best.goals ? p : best);
  res.json(topScorer);
});

// ROUTE 6: Get best assist
app.get('/api/players/best-assist', (req, res) => {
  const bestAssist = squad.reduce((best, p) => p.assist > best.assist ? p : best);
  res.json(bestAssist);
});

// ROUTE 7: Get team stats
app.get('/api/stats', (req, res) => {
  const totalSalary = squad.reduce((sum, p) => sum + p.salary, 0);
  const totalGoals = squad.reduce((sum, p) => sum + p.goals, 0);
  const totalAssists = squad.reduce((sum, p) => sum + p.assist, 0);
  const topScorer = squad.reduce((best, p) => p.goals > best.goals ? p : best);
  
  res.json({
    totalPlayers: squad.length,
    totalSalary,
    totalSalaryFormatted: `N${totalSalary.toLocaleString()}`,
    averageSalary: Math.round(totalSalary / squad.length),
    totalGoals,
    totalAssists,
    topScorer: topScorer.name,
    topScorerGoals: topScorer.goals
  });
});

// ROUTE 8: Get single player by ID
app.get('/api/players/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const player = squad.find(p => p.id === id);
  
  if (!player) {
    return res.status(404).json({ error: `Player with ID ${id} not found` });
  }
  
  res.json(player);
});

// ROUTE 9: Add new player
app.post('/api/players', (req, res) => {
  const { name, age, position, jersey, goals, assist, salary } = req.body;
  
  // Validation - Senior habit!
  if (!name || !age || !position) {
    return res.status(400).json({ error: 'Name, age, and position are required' });
  }
  
  const newPlayer = {
    id: squad.length + 1,
    name,
    age,
    position,
    jersey: jersey || 99,
    goals: goals || 0,
    assist: assist || 0,
    salary: salary || 200000
  };
  
  squad.push(newPlayer);
  
  res.status(201).json({
    message: 'Player added successfully!',
    player: newPlayer,
    totalPlayers: squad.length
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n⚽ Tripple T API running at http://localhost:${PORT}`);
  console.log(`📊 Try: http://localhost:${PORT}/api/players`);
  console.log(`🏆 Top scorer: http://localhost:${PORT}/api/players/top-scorer`);
  console.log(`💰 Stats: http://localhost:${PORT}/api/stats\n`);
});
