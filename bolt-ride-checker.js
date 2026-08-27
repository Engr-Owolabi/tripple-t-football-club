function canRequestRide(balance, isDriverAvailable) {
  
  if (isDriverAvailable === false) {
    console.log("No drivers nearby, please try again");
    return false;
  }

  if (balance < 2000) {
    console.log(`You need at least N2000, you have N${balance}`);
    return false;
  }

  console.log(`Ride confirmed! Balance: N${balance}`);
  return true;
}

canRequestRide(5000, true);   // Ride confirmed
canRequestRide(1000, true);   // Need more money
canRequestRide(5000, false);  // No drivers