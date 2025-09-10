// event listener and auto load scripts for homepage

var main = '/js/json/contents.json';        // where all the apps are stored... main.
const wlocation = window.location.pathname;

document.addEventListener('DOMContentLoaded', function() { // on window load
  particles('/js/json/themes/deepwoken.json');
  if( wlocation == '/' || wlocation == '/index.html'){
    spinSecret(30);                       // spin with a 1/30 chance

  }
  if( wlocation == '/g/' || wlocation == '/g/index.html'){
    printIt(1, main); //calls the printIt function with 1 as the mode so it does default
  }
  confirmation();
});

//all below is the actual functions

function handler(mode, tPath, path){
    if(mode == 0){
        console.log('normal mode');
        iframeHandler(0, path);
    }
    else if(mode == 1){
        console.log('random mode');
        pickRandom();
    }
    else{
        console.log('table mode');
        getTable(tPath);
    }
}
function spinSecret(chance){
    let num = parseInt(Math.random() * chance + 1);                                                     //pulls an int from the 1/30 chance thing because it always outputs floats
    const bar = document.getElementById('pass');
    const img = document.getElementsByClassName('titleimg')[0];                                         //for getting class names u need to add an array 0 or else it doesnt work ill figure out why later
    console.log(num);
    particles('/js/json/themes/deepwoken.json');
    if(num == 1){                                                                                       //changes logo to deepwoken logo on a lucky 3
        img.src = '/img/deepwoken.webp';
        bar.placeholder = '~0.03% chance btw 0:'
    }
}
function pickRandom(){                      
    fetch(main)
        .then(response => response.json())
        .then(data => {pick = data.list;
            let num = parseInt(Math.random() * (pick.length-1) + 1);   //add support for table mode sometime
            console.log(num);
            console.log(pick[num].link);
            iframeHandler(0, (pick[num].link));
        }
    ) 
} 
function particles(path){
/* particlesJS.load(@dom-id, @path-json, @callback (optional)); */
particlesJS.load('particles-js', path, function() { 
  console.log('callback - particles.js config loaded');
});
/* can easily be swapped by rerunning the command with another json

particlesJS.load('particles-js', '/js/json/nyan.json');
the command so i remmeber

*/
}

function pass() {                                          //super secure password system... heh
    let input = document.getElementById('pass').value;     //its oly to ward off some ppl anyways if yk inspect well enough u could easily find the pass
    if(input == 'password4'){
        setTimeout(function(){
            window.location = '/g/';
        }, 250);                                           //delay then callback  for 0.25 second
    }
    else{
        document.getElementById('pass').value = '';
        document.getElementById('pass').placeholder = 'wrong password!';
        alert('wrong password...\ndm @camwym on ig or nixora on discord for the pass!\nima remake this alert later ts is lazy');
    }
}
function iframeHandler(mode, link){
    const iframe = document.getElementById('gFrame')
    const frame =  document.getElementById('frame')
    if(mode == 0){
        frame.classList.add('fadeIn');
        frame.classList.remove('hidden');    
        frame.classList.remove('fadeOut');
        iframe.src = link;
    }
    if(mode == 1){
        frame.classList.add('fadeOut');
        frame.classList.remove('fadeIn');
        iframe.src = "";                    
    }
}
/* code to add the class to the element
let classThing = document.getElementsByClassName('title-container')[0];
classThing.classList.add('fadeout');
*/
function confirmation(){
const url = 'data:image/png;base64,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';
console.image(url, 100);                                                                                                     //img data, command to run the img script, and stuff
console.log('%call scripts loaded okay!🌸\n...shiii idk maybe it didnt but it probably did if ur seeing this\nwindow location:'+wlocation,'color: #ffc4f3; font-size: 20px;'); //ts doesnt even check to see if it loaded just pray for the best ngl
};