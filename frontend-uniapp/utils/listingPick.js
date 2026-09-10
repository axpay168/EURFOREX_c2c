/**
 * 一鍵買／賣：從掛單列表挑一筆可成交單。
 * - buy：使用者買 USDT，單價（EUR / USDT）愈低愈划算。
 * - sell：使用者賣 USDT，單價（EUR / USDT）愈高愈划算。
 * @param {Array<Record<string, unknown>>} items
 * @param {'buy'|'sell'} side
 * @param {number} userId 排除自己的掛單
 * @param {{minAmount?: number, maxAmount?: number}=} options 額外限制，例：等級最低賣出額
 * @returns {Record<string, unknown>|null}
 */
export function pickBestOneClickListing(items, side, userId, options) {
  var want = String(side || '').toLowerCase()
  if (want !== 'buy' && want !== 'sell') return null
  var uid = parseInt(String(userId || '0'), 10) || 0
  var opts = options || {}
  var requiredMin = parseFloat(String(opts.minAmount != null ? opts.minAmount : '0')) || 0
  var requiredMax = parseFloat(String(opts.maxAmount != null ? opts.maxAmount : '0')) || 0
  var candidates = []
  for (var i = 0; i < (items || []).length; i++) {
    var L = items[i] || {}
    if (String(L.side || '').toLowerCase() !== want) continue
    if (uid && parseInt(String(L.owner_user_id || '0'), 10) === uid) continue
    var avail = parseFloat(String(L.available_amount != null ? L.available_amount : ''))
    if (!isFinite(avail) || avail <= 0) continue
    var price = parseFloat(String(L.price != null ? L.price : ''))
    if (!isFinite(price) || price <= 0) continue
    var min = parseFloat(String(L.min_amount != null ? L.min_amount : '0')) || 0
    var max = parseFloat(String(L.max_amount != null ? L.max_amount : '0')) || 0
    if (requiredMin > 0 && max > 0 && max < requiredMin) continue
    if (requiredMax > 0 && min > requiredMax) continue
    candidates.push(L)
  }
  if (!candidates.length) return null
  candidates.sort(function (a, b) {
    var pa = parseFloat(String(a.price)) || 0
    var pb = parseFloat(String(b.price)) || 0
    if (want === 'buy') {
      if (pa !== pb) return pa - pb
    } else {
      if (pa !== pb) return pb - pa
    }
    var aa = parseFloat(String(a.available_amount)) || 0
    var ab = parseFloat(String(b.available_amount)) || 0
    if (aa !== ab) return ab - aa
    return (parseInt(String(b.id || '0'), 10) || 0) - (parseInt(String(a.id || '0'), 10) || 0)
  })
  return candidates[0] || null
}
