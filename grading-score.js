function getGrade(score) {
  
  if (score >= 70) {
    return "A";
  } else if (score >= 60) {
    return "B";
  } else if (score >= 50) {
    return "C";
  } else {
    return "F";
  }
}

console.log("Score 85:", getGrade(85));
console.log("Score 65:", getGrade(65));
console.log("Score 55:", getGrade(55));
console.log("Score 30:", getGrade(30));