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
  
  // Auth states
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    // Check if already logged in
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    loadPlayers();
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
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
        setPlayers([player]);
        setLoading(false);
        return;
      } catch (e) { 
        setLoading(false);
        return; 
      }
    }

    try {
      const res = await fetch(url);
      const data = await res.json();
      const playersData = data.players ? data.players : (Array.isArray(data) ? data : []);
      setPlayers(playersData);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load players', err);
      setPlayers([]);
      setLoading(false);
    }
  }

  async function handleAuth(e) {
    e.preventDefault();
    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? 
        { email: authForm.email, password: authForm.password } :
        { name: authForm.name, email: authForm.email, password: authForm.password };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        alert(`✅ ${data.message} Welcome ${data.user.name}!`);
        setAuthForm({ name: '', email: '', password: '' });
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  }

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    alert('👋 Logged out!');
  }

  async function handleAddPlayer(e) {
    e.preventDefault();
    
    if (!token) {
      alert('🔐 Please login as coach first to add players!');
      return;
    }

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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPlayer)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        alert(`✅ ${data.message} - ${newPlayer.name} added!`);
        setFormData({ name: '', age: '', position: '', jersey: '', goals: '', assist: '', salary: '' });
        loadPlayers('all');
        loadStats();
      } else {
        alert(`❌ ${data.error}`);
      }
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  }

  async function handleEdit(id) {
    if (!token) {
      alert('🔐 Please login as coach to edit players!');
      return;
    }

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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
    if (!token) {
      alert('🔐 Please login as coach to delete players!');
      return;
    }

    if (!confirm(`Delete ${name}? Are you sure? This cannot be undone!`)) return;
    
    try {
      const res = await fetch(`/api/players/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
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
      const res = await fetch(`/api/players/search?name=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setPlayers(data.players || []);
    } catch (err) {
      console.error('Search error', err);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>⚽ Tripple T Football Club</h1>
        <p>Day 12 - MERN Stack with React + JWT Auth | Built by Owolabi | {loading ? 'Loading...' : `${players.length} players`} | {user ? `Coach: ${user.name}` : 'Not logged in'}</p>
      </header>

      <div className="container">
        {/* Auth Section */}
        {!user ? (
          <section className="form-section">
            <h2>{isLogin ? '🔐 Coach Login' : '📝 Register as Coach'}</h2>
            <p style={{marginBottom:'1rem', color:'#666', fontSize:'0.9rem'}}>
              {isLogin ? 'Login to add/edit/delete players. Viewing is public!' : 'Create coach account to manage squad. Only coaches can add/edit/delete!'}
            </p>
            <form onSubmit={handleAuth} className="add-form">
              {!isLogin && (
                <input type="text" placeholder="Name (e.g., Coach Owolabi)" value={authForm.name} onChange={e => setAuthForm({...authForm, name: e.target.value})} required />
              )}
              <input type="email" placeholder="Email (e.g., coach@tripplet.com)" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} required />
              <input type="password" placeholder="Password (min 6 chars)" value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required minLength="6" />
              <button type="submit">{isLogin ? 'Login as Coach' : 'Register as Coach'}</button>
            </form>
            <p style={{marginTop:'1rem', textAlign:'center'}}>
              {isLogin ? "Don't have account? " : "Already have account? "}
              <button onClick={() => setIsLogin(!isLogin)} style={{background:'none', border:'none', color:'#1e3c72', cursor:'pointer', textDecoration:'underline', fontWeight:'bold'}}>
                {isLogin ? 'Register' : 'Login'}
              </button>
            </p>
            <p style={{marginTop:'0.5rem', textAlign:'center', fontSize:'0.85rem', color:'#888'}}>
              Test: coach@tripplet.com / 123456
            </p>
          </section>
        ) : (
          <div className="form-section" style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'1rem'}}>
            <div>
              <p>Welcome, <strong>{user.name}</strong> ({user.email}) - <span style={{background:'#d4edda', padding:'0.2rem 0.5rem', borderRadius:'10px', fontSize:'0.8rem'}}>{user.role}</span></p>
              <p style={{fontSize:'0.85rem', color:'#666', marginTop:'0.3rem'}}>You can now add/edit/delete players! Viewing is public for all.</p>
            </div>
            <button onClick={handleLogout} style={{padding:'0.6rem 1.2rem', background:'#dc3545', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>Logout</button>
          </div>
        )}

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
          <h2>➕ Add New Player {user ? '' : '(Login required)'}</h2>
          <form onSubmit={handleAddPlayer} className="add-form">
            <input type="text" placeholder="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input type="number" placeholder="Age" value={formData.age} onChange={e => setFormData({...formData, age: e.target.value})} min="0" max="100" required />
            <input type="text" placeholder="Position" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})} required />
            <input type="number" placeholder="Jersey" value={formData.jersey} onChange={e => setFormData({...formData, jersey: e.target.value})} min="1" max="99" />
            <input type="number" placeholder="Goals" value={formData.goals} onChange={e => setFormData({...formData, goals: e.target.value})} min="0" />
            <input type="number" placeholder="Assists" value={formData.assist} onChange={e => setFormData({...formData, assist: e.target.value})} min="0" />
            <input type="number" placeholder="Salary" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} min="0" />
            <button type="submit" disabled={!user} style={{opacity: user ? 1 : 0.5}}>{user ? 'Add Player to Squad' : 'Login to Add Player'}</button>
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
                  <tr><td colSpan="10">No players found. Try search or add player (login required).</td></tr>
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
                          <button onClick={() => handleEdit(p._id || p.id)} className="edit-btn" disabled={!user} style={{opacity: user ? 1 : 0.5}}>✏️ Edit</button>
                          <button onClick={() => handleDelete(p._id || p.id, p.name)} className="delete-btn" disabled={!user} style={{opacity: user ? 1 : 0.5}}>🗑️ Delete</button>
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
        <p>Day 12 MERN + JWT Auth | Engr-Owolabi | <a href="/api/players" target="_blank">API: 10 players</a> | <a href="https://github.com/Engr-Owolabi/tripple-t-football-club" target="_blank">GitHub: 20+ commits</a> | Live: Adorable 30 goals | {user ? `Logged in as ${user.name}` : 'Login to manage squad'}</p>
      </footer>
    </div>
  );
}

export default App;
