// TRIPPLE T FOOTBALL CLUB - Owolabi's Custom Version
// Run with: node triple-t-football-club.js

function canEnterClub(age) {
  // Validation first - senior engineers always check bad input
  if (age < 0 || age > 100) {
    console.log(`Oga, age ${age} is not valid. Abeg enter real age.`);
    return;
  }

  if (age >= 18) {
    console.log(`✅ Age ${age}: Welcome to Tripple T Football Club! You are eligible.`);
  } else {
    // THIS IS YOUR BRILLIANT IDEA - Calculate years left!
    let yearsToWait = 18 - age; // Magic formula!
    
    // Make the message dynamic - 1 year vs 2 years
    if (yearsToWait === 1) {
      console.log(`❌ Age ${age}: Oga go house, try again next year! Just ${yearsToWait} more year to go.`);
    } else {
      console.log(`❌ Age ${age}: Oga go house, try again in ${yearsToWait} years time! You need ${yearsToWait} more years.`);
    }

    // BONUS: Tell them what year they can join
    let currentYear = new Date().getFullYear(); // Gets 2026
    let eligibleYear = currentYear + yearsToWait;
    console.log(`   👉 Come back in ${eligibleYear} when you are 18.\n`);
  }
}

console.log("--- TRIPPLE T FOOTBALL CLUB TRYOUTS ---\n");

// Test all your cases
canEnterClub(20); // Welcome
canEnterClub(18); // Welcome - exactly 18
canEnterClub(17); // 1 year
canEnterClub(16); // 2 years
canEnterClub(15); // 3 years
canEnterClub(10); // 8 years
canEnterClub(5);  // 13 years
canEnterClub(1);  // 17 years - your max case!
canEnterClub(0);  // 18 years (baby!)

console.log("\n--- How the calculation works ---");
console.log("Formula: yearsToWait = 18 - age");
console.log("If age = 16, yearsToWait = 18 - 16 = 2 years");
console.log("If age = 10, yearsToWait = 18 - 10 = 8 years");
