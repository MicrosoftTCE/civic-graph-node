var d3 = require('d3');

var textDisplay = function(d) {
  var s = "";

  //  General Information
  s += '<div style="height:30px"><a style="float:right;"><i id="editCurrentInfo" class="icon-pencil on-left"></i></a></div>';
  s += '<h1>' + "<a href=" + '"' + d.url + '" target="_blank">' + d.name + '</a></h1>';
  s += '<h6>' + 'Type of Entity: ' + '</h6>' + ' <h5>' + d.type + '</h5>';


  //do it here
  //



  if (d.location !== null) {
    s += '<br/>' + '<h6> ' + 'Location:  ' + '</h6>';
    var locationArray= d.location;

    if (locationArray.length > 1) {
      var locationArr = [];
      s += '<br/> <h5><ul>';
      locationArray.forEach(function(loc) {
        locationArr.push(loc.location);

      });
      for (var count = 0; count < locationArr.length; count++) {
        s += '<li style="display:block;">' + '<h5><a class="click-location" style="cursor:pointer;">' + locationArr[count] + '</h5></a>' + '</li>';
      }
    }
    else {
      locationArray.forEach(function(loc) {
        locString = loc.location;

        s += '<h5><ul>'
        s += '<li style="display:inline-block;">' + '<h5><a class="click-location" style="cursor:pointer;">' + locString + '</h5></a>' + '</li>';
      });
    }
    s += '</h5></ul><br/>';

  } else {
    s += '<br/>' + '<h6> ' + 'Location:  ' + '</h6>' + ' <h5>' + 'N/A' + '</h5>' + '<br/>';
  }


  if (d.type !== 'Individual') {
    if (d.employees !== null) {
      s += '<h6>' + 'Employees: ' + '</h6> <h5>' + numCommas(d.employees.toString()) + '</h5><br/>';
    } else {
      s += '<h6>' + 'Employees: ' + '</h6> <h5>' + 'N/A' + '</h5><br/>';
    }
  }

  if (d.twitter_handle === null) {
    s += '<h6>' + 'Twitter:  ' + '</h6> <h5>' + 'N/A' + '</h5><br/>';
    s += '<h6>' + 'Twitter Followers: ' + '</h6> <h5>' + 'N/A' + '</h5><br/>';
  } else {
    var twitterLink = (d.twitter_handle).replace('@', '');


    twitterLink = 'https://twitter.com/' + twitterLink;
    s += '<h6>' + 'Twitter:  ' + '</h6> <h5>' + "<a href=" + '"' + twitterLink + '" target="_blank">' + d.twitter_handle + '</h5></a><br/>';
    if (d.followers !== null) {
      s += '<h6>' + 'Twitter Followers:  ' + '</h6> <h5>' + numCommas(d.followers.toString()) + '</h5><br/>';
    } else {
      s += '<h6>' + 'Twitter Followers:  ' + '</h6> <h5>' + 'N/A' + '</h5><br/>';
    }
  }

  //  KEY PEOPLE
  if (d.key_people !== null) {
    s += '<br/><h6>' + 'Key People:' + '</h6>' + '<ul><h5>';
    for (var count = 0; count < d.key_people.length; count++) {
      s += '<li>' + '<a href="http://www.bing.com/search?q=' + (d.key_people[count].name).replace(" ", "%20") + '%20' + (d.nickname).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + d.key_people[count].name + '</a>' + '</li>';
    }
    s += '</h5></ul>';
  }

  // //  FUNDING

  if (d.funding_received === null) {
    s += '<br/><h6>' + 'No known funding received.' + '</h6><br/>';
  } else {
    s += '<br/>' + '<h6>' + 'Received funding from:' + '</h6><ul>';
    (d.funding_received).forEach(function(d) {
      if (d.amount === 0 || d.amount === null) {
        s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (d.entity).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + d.entity + '</a></h5>' + ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>';
      } else {
        s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (d.entity).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + d.entity + '</a></h5>' + ': <strong style="color:rgb(127,186,0);">$' + numCommas(d.amount.toString()) + '</strong>' + '</li>';
      }
      if (d.year === null) {

      } else {

      }
    });
    s += '</ul>'
  }

  if (d.funding_given === null) {
    s += '<br/><h6>' + 'No known funding provided.' + '</h6><br/>';
  } else {
    s += '<br/>' + '<h6>' + 'Gave funding to:' + '</h6><ul>';
    (d.funding_given).forEach(function(d) {
      if (d.amount === 0 || d.amount === null) {
        s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (d.entity).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + d.entity + '</a></h5>' + ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>';
      } else {
        s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (d.entity).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + d.entity + '</a></h5>' + ': <strong style="color:rgb(127,186,0);">$' + numCommas(d.amount.toString()) + '</strong>' + '</li>';
      }
      if (d.year === null) {

      } else {

      }
    });
    s += '</ul>'
  }

  if (d.investments_received === null) {
    s += '<br/><h6>' + 'No known investments received.' + '</h6><br/>';
  } else {
    s += '<br/>' + '<h6>' + 'Received investments from:' + '</h6><ul>';
    (d.investments_received).forEach(function(d) {
      if (d.amount === 0 || d.amount === null) {
        s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (d.entity).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + d.entity + '</a></h5>' + ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>';
      } else {
        s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (d.entity).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + d.entity + '</a></h5>' + ': <strong style="color:rgb(127,186,0);">$' + numCommas(d.amount.toString()) + '</strong>' + '</li>';
      }
      if (d.year === null) {

      } else {

      }
    });
    s += '</ul>'
  }

  if (d.investments_made === null) {
    s += '<br/><h6>' + 'No known investments made.' + '</h6><br/>';
  } else {
    s += '<br/>' + '<h6>' + 'Invested in:' + '</h6><ul>';
    (d.investments_made).forEach(function(d) {
      if (d.amount === 0 || d.amount === null) {
        s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (d.entity).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + d.entity + '</a></h5>' + ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>';
      } else {
        s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (d.entity).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + d.entity + '</a></h5>' + ': <strong style="color:rgb(127,186,0);">$' + numCommas(d.amount.toString()) + '</strong>' + '</li>';
      }
      if (d.year === null) {

      } else {

      }
    });
    s += '</ul>'
  }

  if (d.collaborations === null) {
    s += '<br/><h6>' + 'No known collaborations.' + '</h6><br/>';
  } else {
    s += '<br/>' + '<h6>' + 'Collaborated with:' + '</h6><ul>';
    (d.collaborations).forEach(function(d) {

      s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (d.entity).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + d.entity + '</a></h5>' + '</li>';

    });
    s += '</ul>'
  }

  if (d.data === null) {
    s += '<br/><h6>' + 'No known external data usage.' + '</h6><br/>';
  } else {
    s += '<br/>' + '<h6>' + 'Obtained data from:' + '</h6><ul>';
    (d.data).forEach(function(d) {

      s += '<li><h5>' + '<a href="http://www.bing.com/search?q=' + (d.entity).replace(" ", "%20") + '&go=Submit&qs=bs&form=QBRE" target="_blank">' + d.entity + '</a></h5>' + '</li>';

    });
    s += '</ul>'
  }


  if (d.revenue === null) {
    s += '<br/><h6>' + 'No known revenue information.' + '</h6><br/>';
  } else {
    s += '<br/>' + '<h6>' + 'Revenue:' + '</h6><ul>';
    (d.revenue).forEach(function(d) {
      if (d.amount === 0 || d.amount === null) {
        if (d.year === null) {
          s += '<li><h5>' + 'Unknown Year' + '</h5>' + ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>';
        } else {
          s += '<li><h5>' + d.year + '</h5>' + ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>';
        }
      } else {
        if (d.year === null) {
          s += '<li><h5>' + 'Unknown Year' + '</h5>' + ': <strong style="color:rgb(127,186,0);">$' + numCommas(d.amount.toString()) + '</strong>' + '</li>';
        } else {
          s += '<li><h5>' + d.year + '</h5>' + ': <strong style="color:rgb(127,186,0);">$' + numCommas(d.amount.toString()) + '</strong>' + '</li>';
        }
      }
    });
    s += '</ul>'
  }

  if (d.expenses === null) {
    s += '<br/><h6>' + 'No known expenses information.' + '</h6><br/>';
  } else {
    s += '<br/>' + '<h6>' + 'Expenses:' + '</h6><ul>';
    (d.expenses).forEach(function(d) {
      if (d.amount === 0 || d.amount === null) {
        if (d.year === null) {
          s += '<li><h5>' + 'Unknown Year' + '</h5>' + ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>';
        } else {
          s += '<li><h5>' + d.year + '</h5>' + ': <strong style="color:rgb(255,185,0);">unknown</strong>' + '</li>';
        }
      } else {
        if (d.year === null) {
          s += '<li><h5>' + 'Unknown Year' + '</h5>' + ': <strong style="color:rgb(127,186,0);">$' + numCommas(d.amount.toString()) + '</strong>' + '</li>';
        } else {
          s += '<li><h5>' + d.year + '</h5>' + ': <strong style="color:rgb(127,186,0);">$' + numCommas(d.amount.toString()) + '</strong>' + '</li>';
        }
      }
    });
    s += '</ul>'
  }

  displayFormA(d);

  return s;
};

module.exports = textDisplay;

