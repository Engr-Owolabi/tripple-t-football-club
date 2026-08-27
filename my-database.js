// TRIPPLE T - Advanced Stats: Total Salary, Top Scorer, Best Assist
// Run: node tripple-t-stats.js
// This is what real clubs and Opay do for reports!

const squad = [
  { name: 'Owolabi', age: 20, position: 'Striker', jersey: 9, goals: 9, assist: 5, salary: 500000 },
  { name: 'Uncle Tope', age: 17, position: 'Goalkeeper', jersey: 8, goals: 1, assist: 0, salary: 250000 },
  { name: 'Olaseni', age: 19, position: 'Defender', jersey: 5, goals: 2, assist: 3, salary: 350000 },
  { name: 'Alexander', age: 16, position: 'Striker', jersey: 1, goals: 6, assist: 4, salary: 450000 },
  { name: 'Femi', age: 22, position: 'Winger', jersey: 7, goals: 4, assist: 6, salary: 380000 },
  { name: 'Debola', age: 15, position: 'Midfielder', jersey: 10, goals: 4, assist: 3, salary: 390000 },
  { name: 'Fela', age: 18, position: 'Defender', jersey: 3, goals: 3, assist: 2, salary: 300000 }
];

console.log(`--- Tripple T Full Squad: ${squad.length} players ---`);
console.table(squad);

// IMPORTANT FIX: I changed your salary from '500,000' (string) to 500000 (number)
// Why? You can't calculate total of strings! "500,000" + "250,000" = "500,000250,000" (wrong!)
// Numbers: 500000 + 250000 = 750000 (correct!)
// We will FORMAT it with commas only when displaying.

// 1. TOTAL SALARY - Using reduce (The Senior Way)
const totalSalary = squad.reduce((sum, player) => {
  return sum + player.salary;
}, 0);

console.log(`\n💰 TOTAL MONTHLY SALARY: N${totalSalary.toLocaleString()}`);
// toLocaleString() adds commas back for display: 2620000 => "2,620,000"
console.log(`💰 Average Salary: N${Math.round(totalSalary / squad.length).toLocaleString()}`);

// 2. TOP GOAL SCORER - Find player with highest goals
let topScorer = squad[0]; // Start with first player as best
for (let player of squad) {
  if (player.goals > topScorer.goals) {
    topScorer = player;
  }
}
console.log(`\n⚽ TOP SCORER: ${topScorer.name} with ${topScorer.goals} goals (Jersey ${topScorer.jersey})`);

// Modern way with reduce (same result, shorter):
const topScorer2 = squad.reduce((best, player) => player.goals > best.goals ? player : best);
console.log(`⚽ (Verified with reduce): ${topScorer2.name} - ${topScorer2.goals} goals`);

// 3. HIGHEST ASSIST - Best playmaker
const bestAssist = squad.reduce((best, player) => player.assist > best.assist ? player : best);
console.log(`\n🎯 BEST ASSIST: ${bestAssist.name} with ${bestAssist.assist} assists - Position: ${bestAssist.position}`);

// 4. TOTAL GOALS & ASSISTS
const totalGoals = squad.reduce((sum, player) => sum + player.goals, 0);
const totalAssists = squad.reduce((sum, player) => sum + player.assist, 0);
console.log(`\n📊 TEAM STATS:`);
console.log(`   Total Goals: ${totalGoals}`);
console.log(`   Total Assists: ${totalAssists}`);
console.log(`   Goals per Player: ${(totalGoals / squad.length).toFixed(1)}`);

// 5. MOST EXPENSIVE PLAYER
const highestPaid = squad.reduce((best, player) => player.salary > best.salary ? player : best);
console.log(`\n💎 HIGHEST PAID: ${highestPaid.name} - N${highestPaid.salary.toLocaleString()} - ${highestPaid.position}`);

// 6. SORT BY GOALS - Ranking table
const sortedByGoals = [...squad].sort((a, b) => b.goals - a.goals); // b - a = descending
console.log(`\n🏆 GOAL RANKING (Top to Bottom):`);
console.table(sortedByGoals.map((p, index) => ({
  Rank: index + 1,
  Name: p.name,
  Goals: p.goals,
  Assist: p.assist,
  Salary: `N${p.salary.toLocaleString()}`
})));

// 7. BONUS: Find all strikers
const strikers = squad.filter(p => p.position === 'Striker');
console.log(`\n🔥 STRIKERS (${strikers.length}):`);
console.table(strikers);

// 8. BONUS: Team value if we sell all players (goals * 100k + assist * 50k)
const teamValue = squad.reduce((sum, p) => sum + (p.goals * 100000) + (p.assist * 50000), 0);
console.log(`\n💵 ESTIMATED TEAM MARKET VALUE: N${teamValue.toLocaleString()}`);

console.log("\n--- How reduce works (Your new superpower) ---");
console.log("reduce = Loop through all players and accumulate one result");
console.log("Example: totalSalary starts at 0, then add each player's salary");
console.log("0 + 500000 = 500000, + 250000 = 750000, + 350000 = 1,100,000 ... until total");