export function payoutAssetCode(it) {
  var code = it && it.asset_code ? String(it.asset_code).trim().toUpperCase() : "";
  return code || "USDT";
}

export function filterUsdtPayoutItems(items, assetCode) {
  var list = items || [];
  var expectedAsset = assetCode ? String(assetCode).trim().toUpperCase() : "";
  return list.filter(function (it) {
    var ch = String(it.channel_type || "").toLowerCase();
    var addr = it.payout_address && String(it.payout_address).trim();
    return ch === "usdt" && addr && (!expectedAsset || payoutAssetCode(it) === expectedAsset);
  });
}

export function usdtPayoutRowTitle(it) {
  var holder = it.account_holder && String(it.account_holder).trim();
  var bn = it.bank_name && String(it.bank_name).trim();
  var asset = payoutAssetCode(it);
  var net = it.usdt_network ? String(it.usdt_network).toUpperCase() : "—";
  if (holder) return holder + " · " + asset;
  if (bn) return bn + " · " + net;
  return asset + " · " + net;
}

export function payoutMethodStatusLabel(status, emptyFallback) {
  var fb = emptyFallback != null ? emptyFallback : "—";
  var s = String(status || "").toLowerCase();
  if (s === "pending") return "Pending review";
  if (s === "rejected") return "Rejected";
  if (!s) return fb;
  return s;
}
