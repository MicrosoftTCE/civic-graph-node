var d3 = require('d3');
var $  = require('jquery');

var processFormA = function() {
  console.log("Running processFormA");

  var formObject = {
    type: null,
    categories: null,
    name: null,
    nickname: null,
    locations: [],
    url: null,
    employees: null,
    key_people: null,
    twitter_handle: null,
    followers: null,
    relations: null,
    funding_received: null,
    investments_received: null,
    funding_given: null,
    investments_made: null,
    collaborations: null,
    data: null,
    revenue: null,
    expenses: null,
    influence: null
  };

  // Scrape the web form for pertinent information and
  // store into the object data structure.
  if (
    $('input[name="name"]').val() === "" &&
    $('input[name="location"]').val() === ""
  ) {
    return {
      name: null,
      location: null,
      errorMessage: "The entity name and location have not been filled out."
    };
  } else if ($('input[name="name"]').val() === "") {
    return {
      name: null,
      errorMessage: "The entity name has not been filled out."
    };
  } else if ($('input[name="location"]').val() === "") {
    return {
      location: null,
      errorMessage: "The location has not been filled out."
    };
  } else {
    // Set the entity type.
    if ($('input#rb_forpro').is(":checked")) {
      formObject.type = "For-Profit";
    } else if ($('input#rb_nonpro').is(":checked")) {
      formObject.type = "Non-Profit";
    } else if ($('input#rb_gov').is(":checked")) {
      formObject.type = "Government";
    } else {
      formObject.type = "Individual";
    }

    // Set the entity name.
    formObject.name =
      d3.select(".webform-content input[name='name']")[0][0].value;

    // Grab the categories.
    formObject.categories = [];

    d3.selectAll('.webform-categories input').filter(
      function(d) {
        // console.log("Running filter on .webform-categories input with d =", d);
        if (this.checked === true) {
          switch (this.value) {
            case 'General':
              formObject.categories.push("General Civic Tech");
              break;
            case 'DataAnalytics':
              formObject.categories.push("Data & Analytics");
              break;
            case 'EconGrowthEdu':
              formObject.categories.push("Jobs & Education");
              break;
            case 'SRCities':
              formObject.categories.push("Smart & Resilient Cities");
              break;
            case 'SocialServ':
              formObject.categories.push("Social Services");
              break;
            case 'GovTech':
              formObject.categories.push("GovTech");
              break;
            default:
              break;
          }
        }
      });

    if (formObject.categories.length === 0) { formObject.categories = null; }

    // Obtain the location

    d3.selectAll('.locations').filter(
      function(d) {
        // console.log("Running filter on .locations with d =", d);
        if (this.value !== "") {
          formObject.locations.push(
            {
              city: this.value,
              state: $(this).siblings("#state").val(),
              country: $(this).siblings("#country").val()
            }
          );
        }
      });

    if(formObject.locations.length === 0) { formObject.locations = null; }

    // Obtain the URL
    formObject.url = "";

    if (d3.select("input[name='website']")[0][0].value === "") {
      formObject.url = null;
    } else {
      formObject.url = d3.select("input[name='website']")[0][0].value;
    }

    // Obtain the number of employees.
    formObject.employees = "";

    if (d3.select("input[name='employees']")[0][0].value === "") {
      formObject.employees = null;
    } else {
      formObject.employees = parseInt(d3.select("input[name='employees']")[0][0].value);
    }

    // Obtain the key people (.kpeople)
    formObject.key_people = [];

    d3.selectAll('.kpeople').filter(function(d) {
      // console.log("Running filter on .kpeople with d =", d);
      if (this.value !== "") {
        formObject.key_people.push(this.value);
      }
    });

    if (formObject.key_people.length === 0) { formObject.key_people = null; }

    // Obtain funding information (Don't forget to add total feature later on...)
    formObject.funding_received = [];

    var fund_amount;

    d3.selectAll('.fund-input .funder').filter(
      function(d, i) {
        // console.log("Running filter on .fund-input .funder with d, i =", d, i);
        if (this.value) {
          if (!d3.selectAll('.fund_amt')[0][i].value) {
            fund_amount = null;

            if (!d3.selectAll('.fund_year')[0][i].value) {
              formObject.funding_received.push({
                // ADD id
                name: this.value,
                amount: fund_amount,
                year: null
              });
            } else {
              formObject.funding_received.push({
                name: this.value,
                amount: fund_amount,
                year: d3.selectAll('.fund_year')[0][i].value
              });
            }
          } else {
            fund_amount = d3.selectAll('.fund_amt')[0][i].value;

            if (!d3.selectAll('.fund_year')[0][i].value) {
              formObject.funding_received.push({
                name: this.value,
                amount: fund_amount,
                year: null
              });
            } else {
              formObject.funding_received.push({
                name: this.value,
                amount: fund_amount,
                year: d3.selectAll('.fund_year')[0][i].value
              });
            }
          }
        }
      });

    if (formObject.funding_received.length === 0) {
      formObject.funding_received = null;
    }

    formObject.funding_given = [];

    var fund_given_amount;

    d3.selectAll('.fundgiven-input .fundee').filter(
      function(d, i) {
        // console.log("Running filter on .fundgiven-input .fundee with d, i =", d, i);
        if (this.value) {
          if (!d3.selectAll('.fundgiven_amt')[0][i].value) {
            fund_given_amount = null;

            if (!d3.selectAll('.fundgiven_year')[0][i].value) {
              formObject.funding_given.push({
                name: this.value,
                amount: fund_given_amount,
                year: null
              });
            } else {
              formObject.funding_given.push({
                name: this.value,
                amount: fund_given_amount,
                year: d3.selectAll('.fundgiven_year')[0][i].value
              });
            }
          } else {
            fund_given_amount = d3.selectAll('.fundgiven_amt')[0][i].value;

            if (!d3.selectAll('.fundgiven_year')[0][i].value) {
              formObject.funding_given.push({
                name: this.value,
                amount: fund_given_amount,
                year: null
              });
            } else {
              formObject.funding_given.push({
                name: this.value,
                amount: fund_given_amount,
                year: d3.selectAll('.fundgiven_year')[0][i].value
              });
            }
          }
        }
      });

    if (formObject.funding_given.length === 0) {
      formObject.funding_given = null;
    }

    // Obtain investment information (Don't forget to add total feature later on...)
    formObject.investments_received = [];

    var investment_amount;

    d3.selectAll('.invest-input .investor').filter(
      function(d, i) {
        // console.log("Running filter on .invest-input .investor with d, i =", d, i);
        if (this.value) {
          if (!d3.selectAll('.invest_amt')[0][i].value) {
            investment_amount = null;

            if (!d3.selectAll('.invest_year')[0][i].value) {
              formObject.investments_received.push({
                name: this.value,
                amount: investment_amount,
                year: null
              });
            } else {
              formObject.investments_received.push({
                name: this.value,
                amount: investment_amount,
                year: d3.selectAll('.invest_year')[0][i].value
              });
            }
          } else {
            investment_amount = d3.selectAll('.invest_amt')[0][i].value;

            if (!d3.selectAll('.invest_year')[0][i].value) {
              formObject.investments_received.push({
                name: this.value,
                amount: investment_amount,
                year: null
              });
            } else {
              formObject.investments_received.push({
                name: this.value,
                amount: investment_amount,
                year: d3.selectAll('.invest_year')[0][i].value
              });
            }
          }
        }
      });

    if (formObject.investments_received.length === 0) {
      formObject.investments_received = null;
    }

    formObject.investments_made = [];

    var investment_made_amount;

    d3.selectAll('.investmade-input .investee').filter(function(d, i) {
      // console.log("Running filter on .investmade-input .investee with d, i =", d, i);
      if (this.value) {
        if (!d3.selectAll('.investmade_amt')[0][i].value) {
          investment_made_amount = null;

          if (!d3.selectAll('.investmade_year')[0][i].value) {
            formObject.investments_made.push({
              name: this.value,
              amount: investment_made_amount,
              year: null
            });
          } else {
            formObject.investments_made.push({
              name: this.value,
              amount: investment_made_amount,
              year: d3.selectAll('.investmade_year')[0][i].value
            });
          }
        } else {
          investment_made_amount = d3.selectAll('.investmade_amt')[0][i].value;

          if (!d3.selectAll('.investmade_year')[0][i].value) {
            formObject.investments_made.push({
              name: this.value,
              amount: investment_made_amount,
              year: null
            });
          } else {
            formObject.investments_made.push({
              name: this.value,
              amount: investment_made_amount,
              year: d3.selectAll('.investmade_year')[0][i].value
            });
          }
        }
      }
    });

    if (formObject.investments_made.length === 0) {
      formObject.investments_made = null;
    }

    // Obtain data
    formObject.data = [];

    d3.selectAll('.data-entity').filter(
      function(d, i) {
        // console.log("Running filter on .data-entity with d, i =", d, i);
        if (this.value !== "") {
          formObject.data.push(this.value);
        }
      });

    if (formObject.data.length === 0) { formObject.data = null; }
  }

  return formObject;
};

module.exports = processFormA;
