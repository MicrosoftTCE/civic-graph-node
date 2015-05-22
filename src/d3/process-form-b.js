var d3 = require('d3');

var processFormB =function(formObject) {

  // Set the entity name.
  formObject.nickname =
    d3.select(".webform-content input[name='nickname']")[0][0].value;

  if (!formObject.nickname) { formObject.nickname = formObject.name; }

  formObject.twitter_handle =
    d3.select(".webform-content input[name='twitterhandle']")[0][0].value;

  if (!formObject.twitter_handle) { formObject.twitter_handle = null; }

  // Set the entity type.
  if ($('.webform-influence input#rb_local').is(":checked")) {
    formObject.influence = "local";
  }
  else {
    formObject.influence = "global";
  }

  // Obtain collaborations
  formObject.collaborations = [];

  d3.selectAll('.collaborator').filter(
    function(d) {
      if (this.value) { formObject.collaborations.push(this.value); }
    });

  if (formObject.collaborations.length === 0) { formObject.collaborations = null; }

  // Obtain funding information (Don't forget to add total feature later on...)
  formObject.revenue = [];

  var revenue_year;

  d3.selectAll('.revenue-input .revenue_amt').filter(
    function(d, i) {
      if (this.value) {
        revenue_year = d3.selectAll('.revenue-input .revenue_year')[0][i].value;

        if (revenue_year) {
          formObject.revenue.push({
            amount: this.value,
            year: revenue_year
          });
        } else {
          formObject.revenue.push({
            amount: this.value,
            year: null
          });
        }
      }
    });

  if (formObject.revenue.length === 0) { formObject.revenue = null; }

  formObject.expenses = [];

  var expense_year;

  d3.selectAll('.expense-input .expense_amt').filter(
    function(d, i) {
      if (this.value) {
        expense_year = d3.selectAll('.expense-input .expense_year')[0][i].value;

        if (expense_year) {
          formObject.expenses.push({
            amount: this.value,
            year: expense_year
          });
        } else {
          formObject.expenses.push({
            amount: this.value,
            year: null
          });
        }
      }
    });

  if (formObject.expenses.length === 0) { formObject.expenses = null; }

  return formObject;
}

module.exports = processFormB;
