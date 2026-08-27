// Tripple T Football Club - Full Squad Database

function canEnterClub(age) {
  if (age >= 18) return true;
  return false;
}

// Our database - Array of Objects
const squad = [
  { name: "Owolabi", age: 20, position: "Striker", jersey: 9 },
  { name: "Uncle Tope", age: 17, position: "Goalkeeper", jersey: 8 },
  { name: "Olaseni", age: 19, position: "Defender", jersey: 5 },
  { name: "Alexander", age: 16, position: "Striker", jersey: 1 },
  { name: "Femi", age: 22, position: "Winger", jersey: 7 },
  { name: "Debola", age: 15, position: "Midfielder", jersey: 10 }
];

console.log(`--- Tripple T Squad: ${squad.length} players ---\n`);

// 1. Show all players in a table (beautiful!)
console.table(squad);

// 2. Filter eligible players
const eligibleSquad = squad.filter(player => canEnterClub(player.age));
console.log(`\n✅ Eligible for Tripple T (${eligibleSquad.length} players):`);
console.table(eligibleSquad);

// 3. Get players who need to wait + how long
const waitingList = squad.filter(player => player.age < 18).map(player => {
  return {
    name: player.name,
    age: player.age,
    yearsToWait: 18 - player.age,
    willJoinIn: new Date().getFullYear() + (18 - player.age)
  };
});
console.log(`\n⏳ Waiting List (${waitingList.length} players):`);
console.table(waitingList);

// 4. Add a new player (tryout)
console.log("\n--- New Tryout: Adding Musa ---");
squad.push({ name: "Fela", age: 18, position: "Defender", jersey: 3 });
console.log(`Squad now has ${squad.length} players`);
console.table(squad);

// 5. Find a specific player
const found = squad.find(player => player.name === "Owolabi");
console.log("\n🔍 Found player:", found);