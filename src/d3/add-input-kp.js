var d3 = require('d3');
var $  = require('jquery');

var keyPeopleTmpl = require("../templates/key-people.jade");

var addInputKp = function (idx) {
  if ($('#key-people-' + idx + ' input[name="kpeople"]').val() !== "") {
    d3.select('#key-people-' + idx + ' input[name="kpeople"]').on(
      'keyup',
      null
    );
    idx++; // counter -> 2


    $("#key-people-" + (idx - 1)).after(keyPeopleTmpl({ idx: idx }));

    d3.select("#key-people-" + idx + " input[name='kpeople']").on(
      "keyup",
      function() {
        addInputKp(idx);
      }
    );
  }
};

module.exports = addInputKp;
