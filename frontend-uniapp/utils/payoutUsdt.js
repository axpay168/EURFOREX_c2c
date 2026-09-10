export function filterUsdtPayoutItems(items) {
  var list = items || [];
  return list.filter(function (it) {
    var ch = String(it.channel_type || "").toLowerCase();
    var addr = it.payout_address && String(it.payout_address).trim();
    return ch === "usdt" && addr;
  });
}

export function usdtPayoutRowTitle(it) {
  var holder = it.account_holder && String(it.account_holder).trim();
  var bn = it.bank_name && String(it.bank_name).trim();
  var net = it.usdt_network ? String(it.usdt_network).toUpperCase() : "USDT";
  if (holder) return holder + " · USDT";
  if (bn) return bn + " · " + net;
  return "USDT · " + net;
}

export function payoutMethodStatusLabel(status, emptyFallback) {
  var fb = emptyFallback != null ? emptyFallback : "—";
  var s = String(status || "").toLowerCase();
  if (s === "pending") return "Pending review";
  if (s === "rejected") return "Rejected";
  if (!s) return fb;
  return s;
}
