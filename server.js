const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database
const squad = [
  { id: 1, name: 'Owolabi', age: 20, position: 'Striker', jersey: 9, goals: 9, assist: 5, salary: 500000 },
  { id: 2, name: 'Uncle Tope', age: 17, position: 'Goalkeeper', jersey: 8, goals: 1, assist: 0, salary: 250000 },
  { id: 3, name: 'Olaseni', age: 19, position: 'Defender', jersey: 5, goals: 2, assist: 3, salary: 350000 },
  { id: 4, name: 'Alexander', age: 16, position: 'Striker', jersey: 1, goals: 6, assist: 4, salary: 450000 },
  { id: 5, name: 'Femi', age: 22, position: 'Winger', jersey: 7, goals: 4, assist: 6, salary: 380000 },
  { id: 6, name: 'Debola', age: 15, position: 'Midfielder', jersey: 10, goals: 4, assist: 3, salary: 390000 },
  { id: 7, name: 'Fela', age: 18, position: 'Defender', jersey: 3, goals: 3, assist: 2, salary: 300000 }
];

function canEnterClub(age) { return age >= 18; }

// API Routes
app.get('/api/players', (req, res) => res.json({ total: squad.length, players: squad }));
app.get('/api/players/eligible', (req, res) => {
  const eligible = squad.filter(p => canEnterClub(p.age));
  res.json({ total: eligible.length, players: eligible });
});
app.get('/api/players/waiting', (req, res) => {
  const waiting = squad.filter(p => p.age < 18).map(p => ({
    ...p, yearsToWait: 18 - p.age, willJoinIn: new Date().getFullYear() + (18 - p.age)
  }));
  res.json({ total: waiting.length, players: waiting });
});
app.get('/api/players/top-scorer', (req, res) => {
  const top = squad.reduce((best, p) => p.goals > best.goals ? p : best);
  res.json(top);
});
app.get('/api/players/best-assist', (req, res) => {
  const best = squad.reduce((best, p) => p.assist > best.assist ? p : best);
  res.json(best);
});
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
app.get('/api/players/:id', (req, res) => {
  const player = squad.find(p => p.id === parseInt(req.params.id));
  if (!player) return res.status(404).json({ error: 'Not found' });
  res.json(player);
});
app.post('/api/players', (req, res) => {
  const { name, age, position, jersey, goals, assist, salary } = req.body;
  if (!name || !age || !position) return res.status(400).json({ error: 'Name, age, position required' });
  const newPlayer = {
    id: squad.length + 1,
    name, age, position,
    jersey: jersey || 99,
    goals: goals || 0,
    assist: assist || 0,
    salary: salary || 200000
  };
  squad.push(newPlayer);
  res.status(201).json({ message: 'Player added!', player: newPlayer, totalPlayers: squad.length });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n⚽ Tripple T Full-Stack running at http://localhost:${PORT}`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/players\n`);
});
