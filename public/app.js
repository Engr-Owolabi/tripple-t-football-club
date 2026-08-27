// Tripple T Frontend - Calls your API and displays data
const API_BASE = ''; // Same origin

async function loadStats() {
  try {
    const res = await fetch(`${API_BASE}/api/stats`);
    const stats = await res.json();
    const topScorerRes = await fetch(`${API_BASE}/api/players/top-scorer`);
    const topScorer = await topScorerRes.json();
    const bestAssistRes = await fetch(`${API_BASE}/api/players/best-assist`);
    const bestAssist = await bestAssistRes.json();

    document.getElementById('statsGrid').innerHTML = `
      <div class="stat-card">
        <h3>Total Players</h3>
        <div class="value">${stats.totalPlayers}</div>
        <div class="sub">${stats.totalGoals} goals, ${stats.totalAssists} assists</div>
      </div>
      <div class="stat-card">
        <h3>Total Salary</h3>
        <div class="value">${stats.totalSalaryFormatted}</div>
        <div class="sub">Avg: N${stats.averageSalary.toLocaleString()}</div>
      </div>
      <div class="stat-card">
        <h3>Top Scorer</h3>
        <div class="value">${topScorer.name}</div>
        <div class="sub">${topScorer.goals} goals - ${topScorer.position}</div>
      </div>
      <div class="stat-card">
        <h3>Best Assist</h3>
        <div class="value">${bestAssist.name}</div>
        <div class="sub">${bestAssist.assist} assists - ${bestAssist.position}</div>
      </div>
    `;
  } catch (err) {
    console.error('Failed to load stats', err);
    document.getElementById('statsGrid').innerHTML = `<div class="stat-card"><h3>Error</h3><div class="value">Failed to load</div><div class="sub">Is server running?</div></div>`;
  }
}

async function loadPlayers(filter = 'all') {
  document.querySelectorAll('.filters button').forEach(btn => btn.classList.remove('active'));
  const btnId = filter === 'all' ? 'btn-all' : filter === 'top-scorer' ? 'btn-top' : `btn-${filter}`;
  const btn = document.getElementById(btnId);
  if (btn) btn.classList.add('active');

  let url = `${API_BASE}/api/players`;
  let title = 'Full Squad';

  if (filter === 'eligible') {
    url = `${API_BASE}/api/players/eligible`;
    title = '✅ Eligible Players (Age 18+)';
  } else if (filter === 'waiting') {
    url = `${API_BASE}/api/players/waiting`;
    title = '⏳ Waiting List (Under 18)';
  } else if (filter === 'top-scorer') {
    url = `${API_BASE}/api/players/top-scorer`;
    title = '🏆 Top Scorer';
    try {
      const res = await fetch(url);
      const player = await res.json();
      document.getElementById('tableTitle').textContent = title;
      renderTable([player]);
      return;
    } catch (e) { console.error(e); return; }
  }

  document.getElementById('tableTitle').textContent = title;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const players = data.players || data;
    renderTable(players);
  } catch (err) {
    console.error('Failed to load players', err);
    document.getElementById('squadBody').innerHTML = `<tr><td colspan="9">Failed to load. Is server running at http://localhost:3000?</td></tr>`;
  }
}

function renderTable(players) {
  const tbody = document.getElementById('squadBody');
  if (!players || players.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9">No players found</td></tr>`;
    return;
  }
  tbody.innerHTML = players.map(p => {
    const isEligible = p.age >= 18;
    const statusBadge = isEligible 
      ? `<span class="badge badge-eligible">Eligible</span>`
      : `<span class="badge badge-waiting">${p.yearsToWait ? `${p.yearsToWait}y to wait` : 'Waiting'}</span>`;
    return `
      <tr>
        <td>${p.id}</td>
        <td><strong>${p.name}</strong></td>
        <td>${p.age}</td>
        <td>${p.position}</td>
        <td>${p.jersey}</td>
        <td>${p.goals}</td>
        <td>${p.assist}</td>
        <td>N${p.salary.toLocaleString()}</td>
        <td>${statusBadge}</td>
      </tr>
    `;
  }).join('');
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
      alert(`✅ ${data.message} - ${newPlayer.name} added!`);
      document.getElementById('addPlayerForm').reset();
      loadStats();
      loadPlayers('all');
    } else {
      alert(`❌ Error: ${data.error}`);
    }
  } catch (err) {
    alert('❌ Failed to add player. Is server running?');
    console.error(err);
  }
});

loadStats();
loadPlayers('all');
