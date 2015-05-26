var weightSorter = function(a, b) {
  console.log("Running weightSorter with a, b =", a, b);

  return a.weight - b.weight;
};

module.exports = weightSorter;
