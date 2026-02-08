function estimatePrice({ msrp, year }) {
  if (Number.isFinite(msrp) && msrp > 0) return msrp;

  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - (year || currentYear));
  const base = 35000;              // старт
  const depreciation = 0.07;       // 7% в год
  return Math.round(base * Math.pow(1 - depreciation, age));
}

module.exports = { estimatePrice };
