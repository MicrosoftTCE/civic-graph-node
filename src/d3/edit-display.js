var editDisplay = function(d) {
  console.log("Running editDisplay");
  var webform = "";

  webform +=
    '<h1 id="edit-add-info">' +
      '<i class="icon-plus on-left"></i>' +
      'Add Information' +
    '</h1>';

  return webform;
};

module.exports = editDisplay;
