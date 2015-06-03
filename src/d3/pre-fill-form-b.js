var d3 = require('d3');
var $  = require('jquery');

var utils = require('../utilities');

var preFillFormB = function (obj) {
  console.log(obj,'preFillFormBEntry');
  d3.selectAll('#nickname').text(function(d) {
    this.value = obj.nickname;
  });

  d3.selectAll('#twitterhandle').text(function(d) {
    this.value = obj.twitter_handle;
  });

  // <input id="rb_forpro" type="radio" name="entitytype" value="For-Profit" disabled="">
  //
  d3.selectAll('input[name="entitytype"]').filter(function(d, i) {
    if (obj.entity_type === this.value) {
      this.checked = true;
    }
  });


  d3.selectAll('input[name="influence-type"]').filter(function(d, i) {
    if (obj.influence === "local" && this.value === "Local Influence") {
      this.checked = true;
    } else if (obj.influence === "global" && this.value === "Global Influence") {
      this.checked = true;
    } else if (obj.influence === "national" && this.value === "National Influence") {
      this.checked = true;
    } else {
      this.checked = false;
    }
  });

  if (obj.collaborations !== null) {
    var collaboration = obj.collaborations;

    collaboration.forEach(function(d, i) {
      $("#collaboration-" + i).after(collaborationTmpl({ idx: i }));

      addDataList('#collaboration-' + i + ' datalist', utils.getSortedNameOptions());

      d3.select('#collaboration-' + i + ' input[name="collaboration"]').on('keyup', function() {
        preFillName(this.value, '#collaboration-' + i + ' input[name="collaboration"]');
      });

      d3.select('#collaboration-' + i + ' input[name="collaboration"]').text(function(e) {
        this.value = d.entity;
      });

    });

    d3.select('#collaboration-' + collaboration.length + ' input[name="collaboration"]').on('keyup', function() {
      addInputCollab(collaboration.length);
    });
  }

  if (obj.expenses !== null) {
    var expenseValues = obj.expenses;

    expenseValues.forEach(function(d, i) {
      $("#expense-" + i).after(expensesTmpl({ idx: i }));
      d3.select('#expense-' + i + ' input[name="expense_amt"]').on('keyup', null);

      d3.select('#expense-' + i + ' input[name="expense_amt"]').text(function(e) {
        this.value = d.amount;
      });

      d3.select('#expense-' + i + ' input[name="expense_year"]').text(function(e) {
        this.value = d.year;
      });
    });
    d3.select('#expense-' + expenseValues.length + ' input[name="expense_amt"]').on('keyup', function() {
      addInputExp(expenseValues.length);
    });
  }

  if (obj.revenue !== null) {
    var revenueValues = obj.revenue;

    revenueValues.forEach(function(d, i) {
      $("#revenue-" + i).after(revenueTmpl({ idx: i }));
      d3.select('#revenue-' + i + ' input[name="revenue_amt"]').on('keyup', null);

      d3.select('#revenue-' + i + ' input[name="revenue_amt"]').text(function(e) {
        this.value = d.amount;
      });

      d3.select('#revenue-' + i + ' input[name="revenue_year"]').text(function(e) {
        this.value = d.year;
      });
    });
    d3.select('#revenue-' + revenueValues.length + ' input[name="revenue_amt"]').on('keyup', function() {
      addInputRev(revenueValues.length);
    });
  }
}

module.exports = preFillFormB;
