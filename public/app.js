const API_BASE = '';

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/api/stats`);
    const stats = await res.json();
    const topRes = await fetch(`${API_BASE}/api/players/top-scorer`);
    const top = await topRes.json();
    const assistRes = await fetch(`${API_BASE}/api/players/best-assist`);
    const assist = await assistRes.json();

    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card"><h3>Total Players</h3><div class="value">${stats.totalPlayers}</div><div class="sub">${stats.totalGoals} goals, ${stats.totalAssists} assists</div></div>
      <div class="stat-card"><h3>Total Salary</h3><div class="value">${stats.totalSalaryFormatted}</div><div class="sub">Avg: N${stats.averageSalary.toLocaleString()}</div></div>
      <div class="stat-card"><h3>Top Scorer</h3><div class="value">${top.name}</div><div class="sub">${top.goals} goals - ${top.position}</div></div>
      <div class="stat-card"><h3>Best Assist</h3><div class="value">${assist.name}</div><div class="sub">${assist.assist} assists - ${assist.position}</div></div>
    `;
  } catch (err) {
    console.error(err);
  }
}

async function loadPlayers(filter = 'all') {
  document.querySelectorAll('.filters button').forEach(b => b.classList.remove('active'));
  const btnId = filter === 'all' ? 'btn-all' : filter === 'top-scorer' ? 'btn-top' : `btn-${filter}`;
  const btn = document.getElementById(btnId);
  if (btn) btn.classList.add('active');

  let url = `${API_BASE}/api/players`;
  let title = 'Full Squad';

  if (filter === 'eligible') {
    url = `${API_BASE}/api/players/eligible`;
    title = '✅ Eligible Players';
  } else if (filter === 'waiting') {
    url = `${API_BASE}/api/players/waiting`;
    title = '⏳ Waiting List';
  } else if (filter === 'top-scorer') {
    url = `${API_BASE}/api/players/top-scorer`;
    title = '🏆 Top Scorer';
    try {
      const res = await fetch(url);
      const player = await res.json();
      document.getElementById('tableTitle').textContent = title;
      renderTable([player]);
      return;
    } catch (e) { return; }
  }

  document.getElementById('tableTitle').textContent = title;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const players = data.players || data;
    renderTable(players);
  } catch (err) {
    document.getElementById('squadBody').innerHTML = `<tr><td colspan="10">Failed to load</td></tr>`;
  }
}

function renderTable(players) {
  const tbody = document.getElementById('squadBody');
  if (!players || players.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10">No players found</td></tr>`;
    return;
  }
  tbody.innerHTML = players.map(p => {
    const isEligible = p.age >= 18;
    const statusBadge = isEligible ? `<span class="badge badge-eligible">Eligible</span>` : `<span class="badge badge-waiting">${p.yearsToWait ? `${p.yearsToWait}y wait` : 'Waiting'}</span>`;
    return `
      <tr>
        <td>${p.id || p._id?.slice(-4)}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.age}</td>
        <td>${p.position}</td>
        <td>${p.jersey}</td>
        <td>${p.goals}</td>
        <td>${p.assist}</td>
        <td>N${p.salary.toLocaleString()}</td>
        <td>${statusBadge}</td>
        <td>
          <button onclick="editPlayer('${p._id || p.id}')" style="padding:0.3rem 0.6rem; background:#ffc107; border:none; border-radius:4px; cursor:pointer; margin-right:0.3rem;">✏️ Edit</button>
          <button onclick="deletePlayer('${p._id || p.id}', '${p.name}')" style="padding:0.3rem 0.6rem; background:#dc3545; color:white; border:none; border-radius:4px; cursor:pointer;">🗑️ Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function editPlayer(id) {
  const field = prompt('What to edit? Type: goals, assist, salary, age, position, jersey\nExample: goals');
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
    const res = await fetch(`${API_BASE}/api/players/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field.toLowerCase()]: parsedValue })
    });
    const data = await res.json();
    if (res.ok) {
      alert(`✅ Updated ${data.player.name}: ${field} = ${parsedValue}`);
      loadPlayers('all');
      loadStats();
    } else {
      alert(`❌ Error: ${data.error}`);
    }
  } catch (err) {
    alert('Failed to update');
  }
}

async function deletePlayer(id, name) {
  if (!confirm(`Delete ${name}? Are you sure? This cannot be undone!`)) return;
  
  try {
    const res = await fetch(`${API_BASE}/api/players/${id}`, { method: 'DELETE' });
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

async function searchPlayers() {
  const name = document.getElementById('searchInput').value.trim();
  if (!name) {
    loadPlayers('all');
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/api/players/search?name=${encodeURIComponent(name)}`);
    const data = await res.json();
    renderTable(data.players);
    document.getElementById('tableTitle').textContent = `🔍 Search: "${name}" (${data.total} found)`;
  } catch (err) {
    console.error(err);
  }
}

document.getElementById('addPlayerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const newPlayer = {
    name: document.getElementById('name').value,
    age: parseInt(document.getElementById('age').value),
    position: document.getElementById('position').value,
    jersey: parseInt(document.getElementById('jersey').value) || 99,
    goals: parseInt(document.getElementById('goals').value) || 0,
    assist: parseInt(document.getElementById('assist').value) || 0,
    salary: parseInt(document.getElementById('salary').value) || 200000
  };
  try {
    const res = await fetch(`${API_BASE}/api/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlayer)
    });
    const data = await res.json();
    if (res.ok) {
      alert(`✅ ${data.message}`);
      e.target.reset();
      loadPlayers('all');
      loadStats();
    } else {
      alert(`❌ ${data.error}`);
    }
  } catch (err) {
    alert('Failed to add');
  }
});

document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchPlayers();
});

loadStats();
loadPlayers('all');
