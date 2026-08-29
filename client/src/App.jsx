import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '', age: '', position: '', jersey: '', goals: '', assist: '', salary: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('App mounted, loading data...');
    loadPlayers();
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      console.log('Stats loaded:', data);
      
      const topRes = await fetch('/api/players/top-scorer');
      const topData = await topRes.json();
      
      const assistRes = await fetch('/api/players/best-assist');
      const assistData = await assistRes.json();
      
      setStats({
        ...data,
        topScorer: topData,
        bestAssist: assistData
      });
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  }

  async function loadPlayers(filterType = 'all') {
    setLoading(true);
    setFilter(filterType);
    let url = '/api/players';
    
    if (filterType === 'eligible') url = '/api/players/eligible';
    else if (filterType === 'waiting') url = '/api/players/waiting';
    else if (filterType === 'top-scorer') {
      try {
        const res = await fetch('/api/players/top-scorer');
        const player = await res.json();
        console.log('Top scorer loaded:', player);
        setPlayers([player]);
        setLoading(false);
        return;
      } catch (e) { 
        console.error('Top scorer error', e);
        setLoading(false);
        return; 
      }
    }

    try {
      console.log(`Fetching ${url}...`);
      const res = await fetch(url);
      const data = await res.json();
      console.log(`Response from ${url}:`, data);
      
      // Handle both {total, players} and direct array
      const playersData = data.players ? data.players : (Array.isArray(data) ? data : []);
      console.log(`Loaded ${playersData.length} players from ${url}`);
      
      setPlayers(playersData);
      setLoading(false);
    } catch (err) {
      console.error(`Failed to load players from ${url}`, err);
      setPlayers([]);
      setLoading(false);
    }
  }

  async function handleAddPlayer(e) {
    e.preventDefault();
    try {
      const newPlayer = {
        name: formData.name,
        age: parseInt(formData.age),
        position: formData.position,
        jersey: parseInt(formData.jersey) || 99,
        goals: parseInt(formData.goals) || 0,
        assist: parseInt(formData.assist) || 0,
        salary: parseInt(formData.salary) || 200000
      };

      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(`✅ ${data.message} - ${newPlayer.name} added!`);
        setFormData({ name: '', age: '', position: '', jersey: '', goals: '', assist: '', salary: '' });
        loadPlayers('all');
        loadStats();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  }

  async function handleEdit(id) {
    const field = prompt('What to edit? goals, assist, salary, age, position, jersey, name\nExample: goals');
    if (!field) return;
    
    const validFields = ['goals', 'assist', 'salary', 'age', 'position', 'jersey', 'name'];
    if (!validFields.includes(field.toLowerCase())) {
      alert('Invalid field! Choose: goals, assist, salary, age, position, jersey, name');
      return;
    }
    
    const value = prompt(`Enter new value for ${field}:`);
    if (value === null) return;
    
    let parsedValue = value;
    if (['goals', 'assist', 'salary', 'age', 'jersey'].includes(field.toLowerCase())) {
      parsedValue = parseInt(value);
      if (isNaN(parsedValue)) {
        alert('Please enter a number!');
        return;
      }
    }
    
    try {
      const res = await fetch(`/api/players/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field.toLowerCase()]: parsedValue })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ Updated ${data.player.name}: ${field} = ${parsedValue}`);
        loadPlayers(filter);
        loadStats();
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      alert('Failed to update');
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete ${name}? Are you sure? This cannot be undone!`)) return;
    
    try {
      const res = await fetch(`/api/players/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        alert(`✅ ${data.message}`);
        loadPlayers('all');
        loadStats();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err) {
      alert('Failed to delete');
    }
  }

  async function handleSearch() {
    if (!searchTerm.trim()) {
      loadPlayers('all');
      return;
    }
    try {
      console.log(`Searching for: ${searchTerm}`);
      const res = await fetch(`/api/players/search?name=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      console.log('Search results:', data);
      setPlayers(data.players || []);
    } catch (err) {
      console.error('Search error', err);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>⚽ Tripple T Football Club</h1>
        <p>Day 10-11 - MERN Stack with React | Built by Owolabi | Full-Stack Engineer | {loading ? 'Loading...' : `${players.length} players loaded`}</p>
      </header>

      <div className="container">
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Players</h3>
              <div className="value">{stats.totalPlayers}</div>
              <div className="sub">{stats.totalGoals} goals, {stats.totalAssists} assists</div>
            </div>
            <div className="stat-card">
              <h3>Total Salary</h3>
              <div className="value">{stats.totalSalaryFormatted}</div>
              <div className="sub">Avg: N{stats.averageSalary?.toLocaleString()}</div>
            </div>
            <div className="stat-card">
              <h3>Top Scorer</h3>
              <div className="value">{stats.topScorer?.name || stats.topScorer}</div>
              <div className="sub">{stats.topScorer?.goals || stats.topScorerGoals} goals</div>
            </div>
            <div className="stat-card">
              <h3>Best Assist</h3>
              <div className="value">{stats.bestAssist?.name || 'N/A'}</div>
              <div className="sub">{stats.bestAssist?.assist || 0} assists</div>
            </div>
          </div>
        )}

        <section className="form-section">
          <h2>➕ Add New Player</h2>
          <form onSubmit={handleAddPlayer} className="add-form">
            <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input type="number" placeholder="Age" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} min="0" max="100" required />
            <input type="text" placeholder="Position" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} required />
            <input type="number" placeholder="Jersey" value={formData.jersey} onChange={e => setFormData({...formData, jersey: e.target.value})} min="1" max="99" />
            <input type="number" placeholder="Goals" value={formData.goals} onChange={e => setFormData({...formData, goals: e.target.value})} min="0" />
            <input type="number" placeholder="Assists" value={formData.assist} onChange={e => setFormData({...formData, assist: e.target.value})} min="0" />
            <input type="number" placeholder="Salary" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} min="0" />
            <button type="submit">Add Player to Squad</button>
          </form>
        </section>

        <section className="form-section">
          <h2>🔍 Search Players</h2>
          <div className="search-box">
            <input type="text" placeholder="Search by name (e.g., Owolabi, Adorable)" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} />
            <button onClick={handleSearch}>Search</button>
            <button onClick={() => { setSearchTerm(''); loadPlayers('all'); }} className="clear-btn">Clear</button>
          </div>
        </section>

        <div className="filters">
          <button onClick={() => loadPlayers('all')} className={filter === 'all' ? 'active' : ''}>All Players</button>
          <button onClick={() => loadPlayers('eligible')} className={filter === 'eligible' ? 'active' : ''}>✅ Eligible</button>
          <button onClick={() => loadPlayers('waiting')} className={filter === 'waiting' ? 'active' : ''}>⏳ Waiting</button>
          <button onClick={() => loadPlayers('top-scorer')} className={filter === 'top-scorer' ? 'active' : ''}>🏆 Top Scorer</button>
        </div>

        <section className="table-section">
          <h2>Full Squad - {players.length} Players {loading ? '(Loading...)' : ''}</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Name</th><th>Age</th><th>Position</th><th>Jersey</th><th>Goals</th><th>Assist</th><th>Salary</th><th>Status</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="10">Loading players from MongoDB...</td></tr>
                ) : players.length === 0 ? (
                  <tr><td colSpan="10">No players found. API returned 0. Check console (F12) for logs. API: /api/players should return 10 players. Current filter: {filter}</td></tr>
                ) : (
                  players.map(p => {
                    const isEligible = p.age >= 18;
                    const displayId = p._id ? p._id.slice(-4) : (p.id || 'N/A');
                    const displaySalary = p.salary ? `N${p.salary.toLocaleString()}` : 'N0';
                    const displayName = p.name || 'Unknown';
                    
                    return (
                      <tr key={p._id || p.id || Math.random()}>
                        <td>{displayId}</td>
                        <td><strong>{displayName}</strong></td>
                        <td>{p.age ?? 'N/A'}</td>
                        <td>{p.position || 'N/A'}</td>
                        <td>{p.jersey ?? 'N/A'}</td>
                        <td>{p.goals ?? 0}</td>
                        <td>{p.assist ?? 0}</td>
                        <td>{displaySalary}</td>
                        <td>{isEligible ? <span className="badge badge-eligible">Eligible</span> : <span className="badge badge-waiting">{p.yearsToWait ? `${p.yearsToWait}y wait` : 'Waiting'}</span>}</td>
                        <td>
                          <button onClick={() => handleEdit(p._id || p.id)} className="edit-btn">✏️ Edit</button>
                          <button onClick={() => handleDelete(p._id || p.id, p.name)} className="delete-btn">🗑️ Delete</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer>
        <p>Day 10-11 MERN Stack with React | Engr-Owolabi | <a href="/api/players" target="_blank">API: 10 players</a> | <a href="https://github.com/Engr-Owolabi/tripple-t-football-club" target="_blank">GitHub: 20 commits</a> | Live: Adorable 30 goals</p>
      </footer>
    </div>
  );
}

export default App;
