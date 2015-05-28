var d3 = require('d3');
var $  = require('jquery');

var utils = require('../utilities');

var preFillFormB = function (obj) {
  console.log("Running preFillFormB with obj =", obj);

  d3.selectAll('#nickname').text(function(d) {
    console.log("Setting #nickname to ", obj.nickname);
    this.value = obj.nickname;
  });

  d3.selectAll('#twitterhandle').text(function(d) {
    console.log("Setting #twitterhandle to ", obj.twitter_handle);
    this.value = obj.twitter_handle;
  });

  d3.selectAll('input[name="influence-type"]').filter(function(d, i) {
    console.log("Calling filter on input[name=influence-type] with d, i =", d, i);
    if (obj.influence === "local" && this.value === "Local Influence") {
      this.checked = true;
    } else if (obj.influence === "global" && this.value === "Global Influence") {
      this.checked = true;
    } else {
      this.checked = false;
    }
  });

  if (obj.collaborations !== null) {
    var collaboration = obj.collaborations;

    collaboration.forEach(function(d, i) {
      console.log("Calling forEach on collaboration with d, i =", d, i);
      $("#collaboration-" + i).after(collaborationTmpl({ idx: i }));

      addDataList('#collaboration-' + i + ' datalist', utils.getSortedNameOptions());

      d3.select('#collaboration-' + i + ' input[name="collaboration"]').on('keyup', function() {
        console.log("Calling onKeyup on #collaboration-" + i + " input[name=collaboration]");
        preFillName(this.value, '#collaboration-' + i + ' input[name="collaboration"]');
      });

      d3.select('#collaboration-' + i + ' input[name="collaboration"]').text(function(e) {
        console.log("Calling text on #collaboration-" + i + " input[name=collaboration] with e =", e);
        console.log("Set value to " + d.entity);
        this.value = d.entity;
      });

    });

    d3.select('#collaboration-' + collaboration.length + ' input[name="collaboration"]').on('keyup', function() {
      console.log("Calling onKeyup on #collaboration-" + collaboration.length + " input[name=collaboration]");
      addInputCollab(collaboration.length);
    });
  }

  if (obj.expenses !== null) {
    var expenseValues = obj.expenses;

    expenseValues.forEach(function(d, i) {
      console.log("Calling forEach on expenseValues with d, i =", d, i);
      $("#expense-" + i).after(expensesTmpl({ idx: i }));
      d3.select('#expense-' + i + ' input[name="expense_amt"]').on('keyup', null);
      d3.select('#expense-' + i + ' input[name="expense_amt"]').text(function(e) {
        console.log("Set #expense-" + i + " input[name=expense_amt] = " + d.amount);
        this.value = d.amount;
      });
      d3.select('#expense-' + i + ' input[name="expense_year"]').text(function(e) {
        console.log("Set #expense-" + i + " input[name=expense_year] = " + d.year);
        this.value = d.year;
      });
    });
    d3.select('#expense-' + expenseValues.length + ' input[name="expense_amt"]').on('keyup', function() {
      console.log("Calling onKeyp on #expense-" + expenseValues.length + " input[name=expense_amt]");
      addInputExp(expenseValues.length);
    });
  }

  if (obj.revenue !== null) {
    var revenueValues = obj.revenue;

    revenueValues.forEach(function(d, i) {
      console.log("Calling forEach on revenueValues with d, i =", d, i);
      $("#revenue-" + i).after(revenueTmpl({ idx: i }));
      d3.select('#revenue-' + i + ' input[name="revenue_amt"]').on('keyup', null);
      d3.select('#revenue-' + i + ' input[name="revenue_amt"]').text(function(e) {
        console.log("Set #revenue-" + i + " input[name=revenue_amt] = " + d.amount);
        this.value = d.amount;
      });
      d3.select('#revenue-' + i + ' input[name="revenue_year"]').text(function(e) {
        console.log("Set #revenue-" + i + " input[name=revenue_year] = " + d.year);
        this.value = d.year;
      });
    });
    d3.select('#revenue-' + revenueValues.length + ' input[name="revenue_amt"]').on('keyup', function() {
      console.log("Calling onKeyp on #revenue-" + revenueValues.length + " input[name=revenue_amt]");
      addInputRev(revenueValues.length);
    });
  }
}

module.exports = preFillFormB;
