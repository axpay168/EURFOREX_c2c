/**
 * 前台支援的法幣清單（銀行綁定、法幣提現共用）。
 * nameZh / accountZh 同時是 locales/*.json 的字典 key，其他語系透過 localizedText(zh, en) 取得譯文。
 */
export const FIAT_CURRENCIES = [
  { code: 'EUR', symbol: '€', wallet: 'eur', nameZh: '歐元', nameEn: 'Euro', accountZh: '歐元帳戶', accountEn: 'Euro account' },
  { code: 'CHF', symbol: 'CHF', wallet: 'chf', nameZh: '瑞士法郎', nameEn: 'Swiss Franc', accountZh: '瑞士法郎帳戶', accountEn: 'Swiss franc account' },
  { code: 'USD', symbol: '$', wallet: 'usd', nameZh: '美元', nameEn: 'US Dollar', accountZh: '美元帳戶', accountEn: 'US dollar account' },
  { code: 'GBP', symbol: '£', wallet: 'gbp', nameZh: '英鎊', nameEn: 'Pound Sterling', accountZh: '英鎊帳戶', accountEn: 'Pound sterling account' }
]

export const DEFAULT_FIAT_CODE = 'EUR'

export function normalizeFiatCode(code) {
  const upper = String(code || '').trim().toUpperCase()
  return FIAT_CURRENCIES.some(item => item.code === upper) ? upper : DEFAULT_FIAT_CODE
}

export function fiatCurrencyByCode(code) {
  const normalized = normalizeFiatCode(code)
  return FIAT_CURRENCIES.find(item => item.code === normalized) || FIAT_CURRENCIES[0]
}
