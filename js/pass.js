// i lowk just used ai to obfuscate it im lazy rn
// its not hard to find the password in here.. just a little decoding will work
(function(){
  var _0xa1b2 = [
    "cGFzcw==",
    "cGFzc3dvcmQ0",
    "L2cv",
    "",
    "d3JvbmcgcGFzc3dvcmQh", 
    "d3JvbmcgcGFzc3dvcmQuLi4KZG0gQGNhbXd5bSBvbiBpZyBvciBuaXhvcmEgb24gZGlzY29yZCBmb3IgdGhlIHBhc3MhCmltYSByZW1ha2UgdGhpcyBhbGVydCBsYXRlciB0cyBpcyBsYXp5" // long alert
  ];

  function _0xg(i){
    var idx = parseInt(i,10)^0;
    return atob(_0xa1b2[idx]);
  }

  window["pass"] = function(){
    try {
      var elId = _0xg("0"); // "pass"
      var el = document.getElementById(elId);
      var input = el && el.value;
      if (input == _0xg("1")) { // correct
        setTimeout(function(){
          window.location = _0xg("2"); // "/g/"
        }, 250);
        return;
      } else {
        if (el) el.value = _0xg("3"); // ""
        if (el) el.placeholder = _0xg("4"); // "wrong password!"
        alert(_0xg("5")); // long alert
      }
    } catch (e) {
      try { alert("err"); } catch(_) {}
    }
  };
})();