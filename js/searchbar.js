function myFunction() {
  // Declare variables
  var input, filter, div, p, a, img;
  input = document.getElementById("Search");
  filter = input.value.toUpperCase();
  divs = document.getElementsByClassName("flexboxitems");

  // Loop through all divs, and hide those that don't match the search query
  for (i = 0; i < divs.length; i++) {
    p = divs[i].getElementsByTagName("p")[0];
    if (p.innerHTML.toUpperCase().indexOf(filter) > -1) {
      divs[i].style.display = "";
    } else {
      divs[i].style.display = "none";
    }
  }
}