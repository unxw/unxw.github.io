var clicks = 0;
function uselessWarning(){
  if(clicks<1){
    alert('are you SURE u wanna do this?\n\npress it again to confirm and crash...');
    alert('you should fullscreen it now if ur going to crash ts btw');
  }
  else{
    byeBye()
  }
  clicks++;
}
function byeBye(){
const frame = document.getElementById('frame');
const frameImg = document.getElementById('frameImg');
const imgInput = document.getElementById('imgInput');
frame.classList.remove('hidden');
frameImg.src = imgInput.value;
onbeforeunload = function(){localStorage.x=1};  // death
  setTimeout(function(){
    while(1)location.reload(1)
  }, 10)
}
console.log("crash script loaded");