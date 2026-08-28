require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const Player = require('./models/player'); // lowercase to match file on GitHub

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client', 'dist')));

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas!'))
  .catch(err => console.error('❌ MongoDB error:', err.message));

// SEARCH - Must be BEFORE :id route! Fixed with better error handling
app.get('/api/players/search', async (req, res) => {
  try {
    const { name, position } = req.query;
    console.log(`🔍 Search query: name=${name}, position=${position}`);
    
    let query = {};
    if (name && name.trim() !== '') {
      query.name = { $regex: name.trim(), $options: 'i' };
    }
    if (position && position.trim() !== '') {
      query.position = { $regex: position.trim(), $options: 'i' };
    }
    
    // If no query, return all
    if (Object.keys(query).length === 0) {
      const players = await Player.find().sort({ goals: -1 });
      return res.json({ total: players.length, players });
    }
    
    const players = await Player.find(query).sort({ goals: -1 });
    console.log(`🔍 Found ${players.length} players for query`, query);
    res.json({ total: players.length, players });
  } catch (err) {
    console.error('❌ Search error:', err.message);
    res.status(500).json({ error: 'Search failed: ' + err.message });
  }
});

app.get('/api/players', async (req, res) => {
  try {
    const players = await Player.find().sort({ goals: -1 });
    res.json({ total: players.length, players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/players/eligible', async (req, res) => {
  try {
    const players = await Player.find({ age: { $gte: 18 } }).sort({ goals: -1 });
    res.json({ total: players.length, players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/players/waiting', async (req, res) => {
  try {
    const players = await Player.find({ age: { $lt: 18 } });
    const waiting = players.map(p => ({
      ...p.toObject(),
      yearsToWait: 18 - p.age,
      willJoinIn: new Date().getFullYear() + (18 - p.age)
    }));
    res.json({ total: waiting.length, players: waiting });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/players/top-scorer', async (req, res) => {
  try {
    const top = await Player.findOne().sort({ goals: -1 });
    res.json(top);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/players/best-assist', async (req, res) => {
  try {
    const best = await Player.findOne().sort({ assist: -1 });
    res.json(best);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const players = await Player.find();
    const totalSalary = players.reduce((sum, p) => sum + p.salary, 0);
    const totalGoals = players.reduce((sum, p) => sum + p.goals, 0);
    const totalAssists = players.reduce((sum, p) => sum + p.assist, 0);
    const topScorer = players.reduce((best, p) => p.goals > best.goals ? p : best, players[0] || { name: 'None', goals: 0 });
    res.json({
      totalPlayers: players.length,
      totalSalary,
      totalSalaryFormatted: `N${totalSalary.toLocaleString()}`,
      averageSalary: players.length ? Math.round(totalSalary / players.length) : 0,
      totalGoals,
      totalAssists,
      topScorer: topScorer.name,
      topScorerGoals: topScorer.goals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SINGLE PLAYER BY ID - Must be AFTER search route!
app.get('/api/players/:id', async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json(player);
  } catch (err) {
    console.error('Find by ID error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/players', async (req, res) => {
  try {
    const player = await Player.create(req.body);
    res.status(201).json({ message: 'Player added!', player, totalPlayers: await Player.countDocuments() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/players/:id', async (req, res) => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json({ message: 'Updated', player });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/players/:id', async (req, res) => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) return res.status(404).json({ error: 'Player not found' });
    res.json({ message: `Deleted ${player.name}`, totalPlayers: await Player.countDocuments() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n⚽ Tripple T with fixed search running at http://localhost:${PORT}`);
  console.log(`🔍 Search: http://localhost:${PORT}/api/players/search?name=Owolabi`);
  console.log(`💾 MongoDB Atlas via process.env.MONGODB_URI`);
  console.log(`🌐 Website: http://localhost:${PORT}\n`);
});
