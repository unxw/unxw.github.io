//this will spawn in all of the containers when i actually make this.

let items = [];
function printIt(x, path){                       //recives a mode number... 1 = default sort, 2 = recently played, 3 = priority
    fetch(path)
        .then(response => response.json()) //json is the method that takes a response stream and parses it as a json or smth
        .then(data => {items = data.list;
            console.log(items);            //reads name of array 1, remove the box bracket thing and .name to print all
                if(x == 1){
                    defaultSort(items);
                }
                if(x == 2){
                    recentlyPlayed(items);
                }
        }
    ) 
}                               
function defaultSort(items){                                // no its not the same as the items i declared at the top, its instead the one inside the printit function
    const container = document.querySelector('#contents');
    container.innerHTML = '';                               //clears out the container class
    items.forEach(list => {                                 //we use a back tick to enable to use of template literal or wtv the source said.. anyways now i can pretty much have values i can freely call!! $
        container.innerHTML += `                            
        <a href="${list.link}">
        <button class="container-content" onClick="handler(${list.mode})">
          <img class="content-img" src="${list.img}"/>
          <span class="content-text">${list.name}</span>
        </button>
      </a>
      `
    }
)
}
//stupid data command thing has to be forwarded where THEN i can assign it to my empty array items, where THEN inside that stupid forward curvy bracket i can console.log holy moly i hate javascript
//ok so  according to the internet, since fetch is asynchronous, it apprears that i  cant use it outside the .then block and instead ill just call a function from inside it mwuhaha im so smart

function searchBar() {
    var input, search, i, items, x, text;
    search = document.getElementById('pass');
    input = search.value.toUpperCase();      //makes it not case sensitive
    items = document.getElementsByClassName('container-content');
    for(i = 0; i < items.length; i++) {                 //loop through the array that items= thing makes
        x = items[i].getElementsByTagName('span')[0];   //x is equal to the entire span of items[i], and items[i] is equal to ONE of the container contents going up
        text = x.textContent;                           //text equals the span of x, but JUST the text in it
        if(text.toUpperCase().indexOf(input) > -1) {    //makes text uppercase so that its not case sensitive, does the indexOf thing i used alot in gr 11, and will keep a box active if it is equal to more than 1
            items[i].style.display = "";                //if it = -1 btw or less that means that none of the letters match at all, so hide it (but it isnt so we show it!!)
        } else {
            items[i].style.display = "none";            //if not found, hide it
        }
    }
}