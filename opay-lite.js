// OPAY LITE - Day 2 Project
const user = {
  name: "Owolabi",
  balance: 75000,
  isKycVerified: true
};

function sendMoney(senderBalance, amount, isVerified) {
  // TODO 1: If user is NOT verified and amount > 20000, deny
  if (isVerified === false && amount > 20000) {
    console.log("DENIED: Please complete KYC to send more than N20,000");
    return senderBalance;
  }

  // TODO 2: Check if sender has enough balance
  if (senderBalance >= amount) {
    let newBalance = senderBalance - amount;
    console.log(`SUCCESS: Sent N${amount}. New balance: N${newBalance}`);
    return newBalance;
  } else {
    console.log(`FAILED: Insufficient funds. Balance: N${senderBalance}, Tried: N${amount}`);
    return senderBalance;
  }
}

// TEST YOUR CODE - Don't change these, just run and see
console.log(`\n--- Welcome ${user.name}, Balance: N${user.balance} ---`);
let balance = user.balance;

balance = sendMoney(balance, 10000, user.isKycVerified); // Should work
balance = sendMoney(balance, 50000, user.isKycVerified); // Should work
balance = sendMoney(balance, 20000, user.isKycVerified); // Should fail - not enough

// Bonus test: Unverified user
console.log("\n--- Testing unverified user ---");
sendMoney(100000, 25000, false); // Should fail KYC
sendMoney(100000, 15000, false); // Should pass (under 20k)