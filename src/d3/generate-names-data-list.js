var generateNamesDataList = function (sortedList) {
  var datalist = "";

  for (var i = 0; i < sortedList.length; i++) {
    datalist += '<option value="' + sortedList[i] + '">';
  }

  return datalist;
};

module.exports = generateNamesDataList;
