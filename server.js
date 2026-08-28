require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const Player = require('./models/Player');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas!'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

app.get('/api/players', async (req, res) => {
  const players = await Player.find().sort({ goals: -1 });
  res.json({ total: players.length, players });
});

app.get('/api/players/eligible', async (req, res) => {
  const players = await Player.find({ age: { $gte: 18 } });
  res.json({ total: players.length, players });
});

app.get('/api/players/waiting', async (req, res) => {
  const players = await Player.find({ age: { $lt: 18 } });
  const waiting = players.map(p => ({ ...p.toObject(), yearsToWait: 18 - p.age, willJoinIn: new Date().getFullYear() + (18 - p.age) }));
  res.json({ total: waiting.length, players: waiting });
});

app.get('/api/players/top-scorer', async (req, res) => {
  const top = await Player.findOne().sort({ goals: -1 });
  res.json(top);
});

app.get('/api/players/best-assist', async (req, res) => {
  const best = await Player.findOne().sort({ assist: -1 });
  res.json(best);
});

app.get('/api/stats', async (req, res) => {
  const players = await Player.find();
  const totalSalary = players.reduce((sum, p) => sum + p.salary, 0);
  const totalGoals = players.reduce((sum, p) => sum + p.goals, 0);
  const totalAssists = players.reduce((sum, p) => sum + p.assist, 0);
  const topScorer = players.reduce((best, p) => p.goals > best.goals ? p : best, players[0] || { name: 'None', goals: 0 });
  res.json({ totalPlayers: players.length, totalSalary, totalSalaryFormatted: `N${totalSalary.toLocaleString()}`, averageSalary: players.length ? Math.round(totalSalary / players.length) : 0, totalGoals, totalAssists, topScorer: topScorer.name, topScorerGoals: topScorer.goals });
});

app.get('/api/players/:id', async (req, res) => {
  const player = await Player.findById(req.params.id);
  if (!player) return res.status(404).json({ error: 'Not found' });
  res.json(player);
});

app.post('/api/players', async (req, res) => {
  const player = await Player.create(req.body);
  res.status(201).json({ message: 'Player added!', player, totalPlayers: await Player.countDocuments() });
});

app.put('/api/players/:id', async (req, res) => {
  const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!player) return res.status(404).json({ error: 'Not found' });
  res.json({ message: 'Updated', player });
});

app.delete('/api/players/:id', async (req, res) => {
  const player = await Player.findByIdAndDelete(req.params.id);
  if (!player) return res.status(404).json({ error: 'Not found' });
  res.json({ message: `Deleted ${player.name}`, totalPlayers: await Player.countDocuments() });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n⚽ Tripple T running at http://localhost:${PORT}`);
  console.log(`💾 MongoDB Atlas via process.env.MONGODB_URI`);
  console.log(`🌐 Website: http://localhost:${PORT}\n`);
});