//very simple function that loads off hash link
//example: index.html#name.swf will load name.swf
   const link = window.location.hash.substring(1); // Get the part after the '#' symbol. it will return the ENTIRE THING "#name.swf" so we need to use substring from section 1 instead of 0 to get everything else
    console.log(link);
    const frame = document.getElementById("flashFrame");
    frame.src = "/g/flash/games/" + link;
//very very very bad and simple code but it works so im not complaining