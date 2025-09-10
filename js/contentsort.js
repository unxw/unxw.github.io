//yipee i made it
//ts genuinely might be among the least helpful comments ever
let items = [];
function printIt(x, path){                 //recives a mode number... 1 = default sort, 2 = recently played, 3 = priority
    fetch(path)
        .then(response => response.json()) //json is the method that takes a response stream and parses it as a json or smth
        .then(data => {items = data.list;
            //console.log(items);            //reads name of array 1, remove the box bracket thing and .name to print all
                if(x == 1){
                    sort(items, x);
                }
        }
    ) 
}

function getTable(path){                                                   //HOLY MOLY I FINALLY GOT THIS TO WORK
    const table = document.querySelector('#table-select');                 //pulls the html of the ENTIRE taable select
    const tableSelect = document.getElementById('table-select');           //selects the element of tableseleect
    const playButton = document.getElementById('play');                    //selects the id of play button
    console.log(table);
    table.innerHTML = '';                                                  //clear table
    fetch(path)                                                            //fetch from path that was inputted when this method was called
        .then(response => response.json())                                 //take response from fetched path and parse as a json file
        .then(data => { items = data.list                                  //the parsed file is alwaus called data (i think), make var items equal to data.list (list being the list of things inside the json bcz thats what i called them in the json)
            console.log(items);
            items.forEach(items =>{                                        //for each individual entry in the parsed json data, we do a call back and connect items to it, where then we add the options to the dropdown menu, and do it in that one way with the backticks (i forgot the name sorry) so that i can do the dollar sign thing mwuahah
                table.innerHTML += `<option image="${items.img}" value="${items.link}">${items.name}</option>`; }, // comma bcz i needa run more stuff after
                tableThing(0),                                             // RELEASE THE TABLE
                setTimeout(() => {tableThing(3);}, 0),                     // you dont understand how long this took to fking figure out, i had to commit that cardinal sin of using ai to help me bro... anyways that code is to "Wait for the DOM to update before trying to read the selected option" smh
                playButton.onclick = () => {                               //holy i use too much callback thingies with the => i love my new learnings
                    tableThing(1)
                    iframeHandler(0, tableSelect.value)              //the only reason why this works is because select elements value value automatically gets changed to the value of the selected option
            });
        }
    )
};

function tableThing(x){
    const img = document.getElementById('table-img');                      //select table info and make img equal it
    const tableSelect = document.getElementById('table-select');           // selects table select   heheh pretty ironic nvm holy im a bad joker
    const selectedOption = tableSelect.options[tableSelect.selectedIndex]; // gets seleected option based off of the index of table select, using the .selectedIndex inside of the index / array thing idk
    const table = document.getElementById('table');
        if(x == 0){  
            table.classList.remove('hidden');    
            table.classList.remove('fadeOut');                             // this is for add the the table mode
            table.classList.add('fadeIn');

        }
        else if(x == 1){   
            table.classList.remove('fadeIn');                              //this is for KILL the table mode mwuahhaha
            table.classList.add('fadeOut');
        }
        else{                                                               // this is for change description mode (rn its just an image)
            const optionsImg = selectedOption.getAttribute('image');        // creates const to be equal to the const of selectedoption's image attribute, using getAttribute(), where it is set to the image attribute
            img.src = optionsImg;                                           // make src of the table image to be equal to the image attribute in selectedOption or smth i forgot im so tuff at coding 67
            console.log(optionsImg);
        }
}



function sort(items, x){                        // no its not the same as the items i declared at the top, its instead the one inside the printit function
    items.sort((a, b) => {                          // we gonna sort the items via the js function called sort() a and b get compared but  we use the => callback thing to connect more stuf fto it and yeah-- thank god for the sort funttion it literally loops for you which is why it can read each entry... oh my god it even picks pairs for you (i named them a and b)
    // Sort by priority first                       // okay so i searched it up and this is what it said "The => in JavaScript is part of an arrow function, which is a concise way to write a function." yahoo yipeee
    if (a.priority && !b.priority) {
      return -1; // -1 means to put a first
    }
    if (!a.priority && b.priority) {
      return 1; // 1 means to puit b first
    }

    // we sort by popularity next so that it apears after the poriority always... also it does this when both priorities are the same
    if (a.popular && !b.popular) {
      return -1; // a comes first because a is popular and b isnt
    }
    if (!a.popular && b.popular) {
      return 1; // b comes first because b is popular and a isnt
    }

    // 0 means to keep things as is, and this onlly occurs if a priority/popular and b pri/pop are the same
    return 0;
  });
    const container = document.querySelector('#contents');
    container.innerHTML = '';                               //clears out the container class
    items.forEach(list => {                                 //we use a back tick to enable to use of template literal or wtv the source said.. anyways now i can pretty much have values i can freely call!! 
        container.innerHTML += `                            
        <button class="container-content" onClick="handler(${list.mode}, '${list.link}', '${list.tablePath}')">
          <img class="content-img" src="${list.img}"/>
          <span class="content-text">${list.name}</span>
        </button>
      `
    }  // the general template for each entry. all of the entries have the handler call in it, where it grabs the data from a json and then attatches the following to the function (go down)
)      // list.mode = the mode that handler will follow    table path is used for when handler needs to call the table function and will pass the json location to it.   link is just so the iframe knows what to put over the screen
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