export function truncateNumber(value, digits) {
  var precision = Math.max(0, Number(digits == null ? 2 : digits) || 0);
  var numberValue = Number(value || 0);
  if (!isFinite(numberValue)) return 0;
  var factor = Math.pow(10, precision);
  if (!isFinite(factor) || factor <= 0) return numberValue;
  return (numberValue < 0 ? Math.ceil(numberValue * factor) : Math.floor(numberValue * factor)) / factor;
}

export function formatTruncatedAmount(value, digits, options) {
  var precision = Math.max(0, Number(digits == null ? 2 : digits) || 0);
  var opts = options || {};
  return truncateNumber(value, precision).toLocaleString(opts.locale || "en-GB", {
    minimumFractionDigits: opts.minimumFractionDigits == null ? precision : opts.minimumFractionDigits,
    maximumFractionDigits: precision
  });
}

export function trimTruncatedNumber(value, digits) {
  var precision = Math.max(0, Number(digits == null ? 2 : digits) || 0);
  return truncateNumber(value, precision)
    .toFixed(precision)
    .replace(/\.0+$/, "")
    .replace(/(\.\d*?)0+$/, "$1");
}
