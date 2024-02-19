x = String("It is ");
y = String(" where i am... WAIT GET OUT MY CODE");
function getLocalTime() {
    let now = new Date();
    return now.toLocaleTimeString();
  }
  console.log("im pretty sure your javascript is working if ya see this lol")
  console.log(x + getLocalTime() + y) // Outputs current date and time in default format
