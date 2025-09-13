function byeBye(){
onbeforeunload = function(){localStorage.x=1};  //

if(confirm("suffer the wrath of being off task in class")){
  setTimeout(function(){
    while(1)location.reload(1)
  }, 1000)
}
}