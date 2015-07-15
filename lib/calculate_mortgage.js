var defaultMortgageOptions = {
    initialDeposit: 0,
    age: 18,
    monthlyIncome: 1,
    interest: 0.1,
    term: 10,
    monthlyExpenses: 0,
    settings: {
      maxAge: 65,
      personalTaxRate: 0,
      riskRate: 0.36
    }
  },
  _ = require("lodash"),
  clone = _.compose(JSON.parse, JSON.stringify);

function calculateMortgage(options) {

  // add missing parameters.
  options = _.defaults(clone(options || {}), defaultMortgageOptions);
  var settings =
    _.defaults(clone(options.settings || {}), defaultMortgageOptions.settings);

  // prevent non desired values
  _.forEach(options, function (n, key) {
    if (n < defaultMortgageOptions[key] || isNaN(n)) {
      n = defaultMortgageOptions[key];
      options[key] = defaultMortgageOptions[key];
    }
  });

  if (+options.monthlyExpenses > +options.monthlyIncome) {
    options.monthlyExpenses = options.monthlyIncome;
  }

  // economic formula for maximum pay.
  var findMaxPay = function (monthlyIncome, monthlyExpenses) {
    var maxPay = (monthlyIncome - monthlyExpenses) * settings.riskRate;
    return maxPay;
  };

  // economic formula for total mortgage.
  var findMortgage = function (pay, monthlyInterest, totalPeriods) {
    var mortgage =
      (pay * ((1 - (Math.pow((1 +
        (monthlyInterest / 100)), -totalPeriods))))) / (monthlyInterest / 100);
    return mortgage;
  };

  var periodsRequested = options.payments || (options.term * 12),
    totalPeriods =
    getMaxTerm(options.age, settings.maxAge, periodsRequested),
    maxMonthlyPayment =
    findMaxPay(options.monthlyIncome, options.monthlyExpenses),
    mortgageTotal =
    findMortgage(maxMonthlyPayment, (options.interest) / 12, totalPeriods),
    totalPriceHouse = mortgageTotal + options.initialDeposit;

  return {
    maxMonthlyPayment: maxMonthlyPayment,
    monthlyIncome: options.monthlyIncome,
    totalPriceHouse: totalPriceHouse,
    mortgageTotal: mortgageTotal,
  };
}

function getMaxTerm(age, maxAge, periodsRequested) {
  var maxPeriods = ((maxAge - age) * 12);
  if (maxPeriods > periodsRequested) {
    return periodsRequested;
  } else {
    return maxPeriods;
  }
}

if (typeof module !== "undefined") {
  module.exports = calculateMortgage;
}