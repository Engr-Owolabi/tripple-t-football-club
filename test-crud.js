// Search players by name or position
app.get('/api/players/search', async (req, res) => {
  try {
    const { name, position } = req.query;
    let query = {};
    if (name) query.name = { $regex: name, $options: 'i' }; // Case-insensitive
    if (position) query.position = position;
    
    const squad = await readSquad(); // For file version
    // For MongoDB: const players = await Player.find(query);
    
    let players = squad;
    if (name) players = players.filter(p => p.name.toLowerCase().includes(name.toLowerCase()));
    if (position) players = players.filter(p => p.position === position);
    
    res.json({ total: players.length, players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});