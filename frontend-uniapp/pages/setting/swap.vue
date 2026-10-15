<template>
  <div>
    <header class="fixed top-0 w-full border-b border-primary/10 bg-white/75 backdrop-blur-3xl shadow-[0_12px_32px_rgba(33,79,131,0.08)] flex justify-between items-center px-6 h-14 z-50">
      <a class="swap-top-logo swap-top-back" href="#/pages/setting/user" :aria-label="localizedText('返回個人中心', 'Back to profile')">
        <span aria-hidden="true">‹</span>
      </a>
      <div class="font-headline text-lg font-bold text-on-surface">{{ localizedText('閃兌', 'Swap') }}</div>
      <a class="swap-top-bell" href="#/pages/setting/fundRecord" :aria-label="localizedText('資金紀錄', 'Fund records')">
        <img :src="profileIcons.bell" alt="" aria-hidden="true" />
      </a>
    </header>

    <main class="swap-page mx-auto max-w-lg px-4 pt-20 pb-32">
      <section class="swap-panel swap-panel--from">
        <div class="swap-panel__glow" aria-hidden="true"></div>
        <div class="swap-panel__head">
          <span>{{ localizedText('從', 'From') }}</span>
          <button type="button" class="swap-all-btn" @click="fillMax">{{ localizedText('全部', 'ALL') }}</button>
        </div>
        <div class="swap-amount-field">
          <input ref="fromAmountInput" v-model="fromAmount" inputmode="decimal" autocomplete="off" type="text" placeholder="0" @input="normalizeInput" />
          <button type="button" class="swap-asset-select" @click="openPicker('from')">
            <img :src="fromAsset.icon" alt="" aria-hidden="true" />
            <strong>{{ fromAsset.code }}</strong>
            <span class="swap-asset-select__chevron" aria-hidden="true"></span>
          </button>
        </div>
        <p class="swap-balance">
          {{ localizedText('可用餘額', 'Available balance') }}:
          <button type="button" @click="fillMax">{{ formatAmount(fromBalance, fromAsset.decimals) }} {{ fromAsset.code }}</button>
        </p>
      </section>

      <button type="button" class="swap-flip-btn" :aria-label="localizedText('交換幣種', 'Switch assets')" @click="flipAssets">⇅</button>

      <section class="swap-panel swap-panel--to">
        <div class="swap-panel__glow" aria-hidden="true"></div>
        <div class="swap-panel__head"><span>{{ localizedText('到', 'To') }}</span></div>
        <div class="swap-amount-field swap-amount-field--readonly">
          <input ref="toAmountInput" :value="estimatedToAmount" readonly type="text" placeholder="0" />
          <button type="button" class="swap-asset-select" @click="openPicker('to')">
            <img :src="toAsset.icon" alt="" aria-hidden="true" />
            <strong>{{ toAsset.code }}</strong>
            <span class="swap-asset-select__chevron" aria-hidden="true"></span>
          </button>
        </div>
        <p class="swap-balance swap-balance--muted">{{ localizedText('預估到帳數量', 'Estimated received amount') }}</p>
      </section>

      <section class="swap-rate-card">
        <div class="swap-rate-card__shine" aria-hidden="true"></div>
        <span class="swap-rate-card__icon" aria-hidden="true"><img :src="profileIcons.swap" alt="" /></span>
        <span class="swap-rate-card__label">{{ localizedText('匯率', 'Rate') }}</span>
        <strong class="swap-rate-card__value">{{ rateDisplay }}</strong>
        <span class="swap-rate-card__info" :title="rateSourceLabel" aria-hidden="true">ⓘ</span>
      </section>

      <p v-if="swapError" class="swap-error">{{ swapError }}</p>
      <button type="button" class="swap-preview-btn" :disabled="submitting" @click="previewSwap">{{ submitting ? localizedText('兌換中...', 'Swapping...') : localizedText('預覽閃兌', 'Preview Swap') }}</button>
    </main>

    <nav class="eurforex-home-bottom-nav fixed bottom-0 left-0 w-full z-50 rounded-t-2xl bg-white/78 backdrop-blur-lg shadow-[0px_-8px_24px_rgba(33,79,131,0.08)] font-['Manrope']" :aria-label="localizedText('主頁底部導航', 'Home bottom navigation')">
      <div class="flex justify-around items-center h-20 px-4 pb-safe">
        <a class="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary-dim transition-all" href="#/pages/index/index">
          <img class="eurforex-nav-brand-icon" :src="logoSrc" :alt="localizedText('EURFOREX 主頁', 'EURFOREX Home')" />
          <span class="text-[11px] font-semibold tracking-wide mt-0.5">{{ localizedText('主頁', 'Home') }}</span>
        </a>
        <a class="flex flex-col items-center justify-center text-primary-dim bg-primary-container/60 rounded-xl px-3 py-1 transition-all active:scale-90" href="#/pages/index/hall">
          <img class="swap-nav-icon" :src="profileIcons.tradeNav" alt="" aria-hidden="true" />
          <span class="text-[11px] font-semibold tracking-wide mt-0.5">{{ localizedText('交易大廳', 'Trading Hall') }}</span>
        </a>
        <a class="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary-dim transition-all" href="#/pages/setting/myTask">
          <img class="swap-nav-icon" :src="profileIcons.orderNav" alt="" aria-hidden="true" />
          <span class="text-[11px] font-semibold tracking-wide mt-0.5">{{ localizedText('訂單', 'Orders') }}</span>
        </a>
        <a class="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary-dim transition-all" href="#/pages/setting/user">
          <img class="swap-nav-icon" :src="profileIcons.profileNavActive" alt="" aria-hidden="true" />
          <span class="text-[11px] font-semibold tracking-wide mt-0.5">{{ localizedText('個人中心', 'Profile') }}</span>
        </a>
      </div>
    </nav>

    <div v-show="pickerOpen" class="swap-picker" role="dialog" aria-modal="true">
      <div class="swap-picker__backdrop" @click="closePicker"></div>
      <div class="swap-picker__sheet">
        <div class="swap-picker__head">
          <strong>{{ pickerSide === 'from' ? localizedText('選擇賣出幣種', 'Select from asset') : localizedText('選擇買入幣種', 'Select to asset') }}</strong>
          <button type="button" @click="closePicker">×</button>
        </div>
        <button v-for="asset in pickerAssets" :key="asset.code" type="button" class="swap-picker__item" @click="selectAsset(asset.code)">
          <img :src="asset.icon" alt="" aria-hidden="true" />
          <span><strong>{{ asset.code }}</strong><small>{{ asset.name }}</small></span>
          <em>{{ formatAmount(balanceFor(asset.code), asset.decimals) }}</em>
        </button>
      </div>
    </div>

    <div v-show="confirmOpen" class="swap-confirm" role="dialog" aria-modal="true" :aria-label="localizedText('確認閃兌', 'Confirm swap')">
      <div class="swap-confirm__backdrop" @click="closeConfirm"></div>
      <section class="swap-confirm__card">
        <button type="button" class="swap-confirm__close" @click="closeConfirm">×</button>
        <div class="swap-confirm__icon"><img :src="profileIcons.swap" alt="" aria-hidden="true" /></div>
        <h2>{{ localizedText('確認閃兌', 'Confirm swap') }}</h2>
        <p>{{ localizedText('請確認兌換數量與預估到帳。', 'Please confirm the swap amount and estimated received amount.') }}</p>
        <div class="swap-confirm__quote">
          <div><span>{{ localizedText('賣出', 'From') }}</span><strong>{{ confirmFromDisplay }}</strong></div>
          <div><span>{{ localizedText('買入', 'To') }}</span><strong>{{ confirmToDisplay }}</strong></div>
          <div><span>{{ localizedText('匯率', 'Rate') }}</span><strong>{{ rateDisplay }}</strong></div>
        </div>
        <button type="button" class="swap-confirm__primary" :disabled="submitting" @click="submitSwap">{{ submitting ? localizedText('處理中...', 'Processing...') : localizedText('確認兌換', 'Confirm swap') }}</button>
        <button type="button" class="swap-confirm__secondary" :disabled="submitting" @click="closeConfirm">{{ localizedText('取消', 'Cancel') }}</button>
      </section>
    </div>
  </div>
</template>

<script>
import { brandMarkLogo } from '@/assets/images'
import profileBellIcon from '@/static/icons/profile/bell.svg'
import profileOrderNavIcon from '@/static/icons/profile/order-nav.svg'
import profileProfileNavActiveIcon from '@/static/icons/profile/profile-nav-active.svg'
import profileSwapIcon from '@/static/icons/profile/swap-white.svg'
import profileTradeNavIcon from '@/static/icons/profile/trade-nav.svg'
import topupUsdtIcon from '@/static/icons/topup/usdt.svg'
import topupUsdcIcon from '@/static/icons/topup/usdc.svg'
import topupBtcIcon from '@/static/icons/topup/btc.svg'
import topupEthIcon from '@/static/icons/topup/eth.svg'
import topupTrxIcon from '@/static/icons/topup/trx.svg'
import { userApi } from '@/utils/api'
import { formatTruncatedAmount, trimTruncatedNumber } from '@/utils/amountFormat'

var BODY_CLASSES = ['nc2c-page', 'nc2c-page--swap', 'font-body', 'min-h-screen', 'bg-background', 'pb-32', 'text-on-surface', 'antialiased']
var ASSETS = [
  { code: 'USDT', name: 'Tether USD', icon: topupUsdtIcon, wallet: 'cash_usdt', decimals: 2 },
  { code: 'USDC', name: 'USD Coin', icon: topupUsdcIcon, wallet: 'spot_usdc', decimals: 2 },
  { code: 'BTC', name: 'Bitcoin', icon: topupBtcIcon, wallet: 'spot_btc', decimals: 8 },
  { code: 'ETH', name: 'Ethereum', icon: topupEthIcon, wallet: 'spot_eth', decimals: 6 },
  { code: 'TRX', name: 'TRON', icon: topupTrxIcon, wallet: 'spot_trx', decimals: 2 }
]

export default {
  name: 'SwapH5',
  data: function () {
    return { logoSrc: brandMarkLogo, profileIcons: { bell: profileBellIcon, swap: profileSwapIcon, tradeNav: profileTradeNavIcon, orderNav: profileOrderNavIcon, profileNavActive: profileProfileNavActiveIcon }, assets: ASSETS, fromCode: 'USDT', toCode: 'USDC', fromAmount: '', balances: {}, prices: { USDT: 1, USDC: 1 }, rateSource: '', pickerOpen: false, pickerSide: 'from', confirmOpen: false, submitting: false, swapError: '' }
  },
  computed: {
    fromAsset: function () { return this.assetByCode(this.fromCode) },
    toAsset: function () { return this.assetByCode(this.toCode) },
    fromBalance: function () { return this.balanceFor(this.fromCode) },
    amountNumber: function () {
      var n = parseFloat(String(this.fromAmount || '').replace(/,/g, '').trim())
      return isFinite(n) && n > 0 ? n : 0
    },
    toAmountNumber: function () {
      var fromUsd = Number(this.prices[this.fromCode] || 0)
      var toUsd = Number(this.prices[this.toCode] || 0)
      if (!this.amountNumber || !fromUsd || !toUsd) return 0
      return this.amountNumber * fromUsd / toUsd
    },
    estimatedToAmount: function () { return this.toAmountNumber ? this.formatAmount(this.toAmountNumber, this.toAsset.decimals) : '' },
    rateDisplay: function () {
      var fromUsd = Number(this.prices[this.fromCode] || 0)
      var toUsd = Number(this.prices[this.toCode] || 0)
      if (!fromUsd || !toUsd) return this.localizedText('載入中', 'Loading')
      return '1 ' + this.toCode + ' = ' + this.formatRate(toUsd / fromUsd) + ' ' + this.fromCode
    },
    rateSourceLabel: function () { return this.rateSource || 'Market quote' },
    pickerAssets: function () {
      return this.assets
    },
    confirmFromDisplay: function () {
      return this.trimNumber(this.amountNumber, this.fromAsset.decimals) + ' ' + this.fromCode
    },
    confirmToDisplay: function () {
      return this.estimatedToAmount + ' ' + this.toCode
    }
  },
  watch: {
    fromAmount: function () {
      if (this.amountNumber > this.fromBalance) this.fromAmount = this.trimNumber(this.fromBalance, this.fromAsset.decimals)
      this.$nextTick(this.fitAmountInputs)
    },
    fromCode: function () { this.$nextTick(this.fitAmountInputs) },
    toCode: function () { this.$nextTick(this.fitAmountInputs) },
    estimatedToAmount: function () { this.$nextTick(this.fitAmountInputs) }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) document.body.classList.add(BODY_CLASSES[i])
      document.body.setAttribute('data-nc2c-page', 'swap')
      document.body.setAttribute('data-nc2c-locked', 'true')
    } catch (e) {}
    this.loadSharedScript('/static/previews/shared/marble-bg.js', 'eurforexMarbleBgJs')
    this.loadBalances()
    this.loadRates()
    this._balanceRefreshHandler = this.refreshBalancesWhenVisible.bind(this)
    try {
      window.addEventListener('focus', this._balanceRefreshHandler)
      window.addEventListener('pageshow', this._balanceRefreshHandler)
      document.addEventListener('visibilitychange', this._balanceRefreshHandler)
    } catch (e) {}
    this.$nextTick(this.fitAmountInputs)
  },
  beforeDestroy: function () {
    try {
      if (this._balanceRefreshHandler) {
        window.removeEventListener('focus', this._balanceRefreshHandler)
        window.removeEventListener('pageshow', this._balanceRefreshHandler)
        document.removeEventListener('visibilitychange', this._balanceRefreshHandler)
      }
      document.body.style.overflow = ''
      for (var i = 0; i < BODY_CLASSES.length; i++) document.body.classList.remove(BODY_CLASSES[i])
      document.body.removeAttribute('data-nc2c-page')
      document.body.removeAttribute('data-nc2c-locked')
    } catch (e) {}
  },
  methods: {
    assetByCode: function (code) { return this.assets.find(function (asset) { return asset.code === code }) || this.assets[0] },
    balanceFor: function (code) { return Number(this.balances[code] || 0) },
    refreshBalancesWhenVisible: function () {
      try {
        if (typeof document !== 'undefined' && document.hidden) return
      } catch (e) {}
      var now = Date.now()
      if (this._lastBalanceRefreshAt && now - this._lastBalanceRefreshAt < 800) return
      this._lastBalanceRefreshAt = now
      this.loadBalances()
    },
    loadBalances: function () {
      var self = this
      userApi.overview().then(function (data) {
        var map = (data && data.wallet_map) || {}
        var next = {}
        self.assets.forEach(function (asset) { var row = map[asset.wallet] || {}; next[asset.code] = Number(row.available_balance || 0) || 0 })
        self.balances = next
      }).catch(function () { self.balances = {} })
    },
    loadRates: function () {
      var self = this
      userApi.marketSnapshot().then(function (data) {
        var next = { USDT: 1, USDC: 1, TRX: 0.34 }
        ;((data && data.items) || []).forEach(function (item) {
          var code = String(item.code || '').toUpperCase()
          var price = Number(String(item.price || '').replace(/,/g, ''))
          if (price > 0) next[code] = price
        })
        self.prices = Object.assign({}, self.prices, next)
        self.rateSource = 'Platform market snapshot'
      }).catch(function () {
        self.prices = Object.assign({}, self.prices, { BTC: 67432, ETH: 3492, TRX: 0.34 })
        self.rateSource = 'Fallback quote'
      })
    },
    normalizeInput: function () {
      var raw = String(this.fromAmount || '').replace(/[^\x00-\x7F]/g, '').replace(/[^0-9.]/g, '')
      var firstDot = raw.indexOf('.')
      if (firstDot >= 0) raw = raw.slice(0, firstDot + 1) + raw.slice(firstDot + 1).replace(/\./g, '')
      this.fromAmount = raw
    },
    fitAmountInputs: function () {
      if (typeof window === 'undefined') return
      var refs = [this.$refs.fromAmountInput, this.$refs.toAmountInput]
      refs.forEach(function (el) {
        if (!el) return
        el.style.fontSize = ''
        el.style.letterSpacing = ''
        var size = parseFloat(window.getComputedStyle(el).fontSize) || 32
        var minSize = 20
        var availableWidth = el.clientWidth
        if (!availableWidth) return
        while (size > minSize && el.scrollWidth > availableWidth + 1) {
          size -= 1
          el.style.fontSize = size + 'px'
        }
        if (el.scrollWidth > availableWidth + 1) el.style.letterSpacing = '-0.06em'
      })
    },
    fillMax: function () { this.fromAmount = this.trimNumber(this.fromBalance, this.fromAsset.decimals) },
    flipAssets: function () { var oldFrom = this.fromCode; this.fromCode = this.toCode; this.toCode = oldFrom; this.fromAmount = '' },
    openPicker: function (side) { this.pickerSide = side; this.pickerOpen = true; try { document.body.style.overflow = 'hidden' } catch (e) {} },
    closePicker: function () { this.pickerOpen = false; try { document.body.style.overflow = '' } catch (e) {} },
    selectAsset: function (code) {
      if (this.pickerSide === 'from') {
        if (code === this.toCode) {
          this.toCode = this.fromCode
        }
        this.fromCode = code
      } else {
        if (code === this.fromCode) {
          this.fromCode = this.toCode
        }
        this.toCode = code
      }
      this.fromAmount = ''
      this.closePicker()
    },
    previewSwap: function () {
      this.swapError = ''
      if (!this.amountNumber) { this.swapError = this.localizedText('請輸入閃兌數量。', 'Please enter a swap amount.'); return }
      if (this.amountNumber > this.fromBalance) { this.fillMax(); return }
      if (!this.toAmountNumber) { this.swapError = this.localizedText('暫無可用匯率，請稍後再試。', 'Quote unavailable. Please try again later.'); return }
      this.confirmOpen = true
      try { document.body.style.overflow = 'hidden' } catch (e) {}
    },
    closeConfirm: function () {
      if (this.submitting) return
      this.confirmOpen = false
      try { if (!this.pickerOpen) document.body.style.overflow = '' } catch (e) {}
    },
    submitSwap: function () {
      if (this.submitting) return
      var self = this
      this.swapError = ''
      this.submitting = true
      userApi.createSwap({ from_asset: this.fromCode, to_asset: this.toCode, amount: this.trimNumber(this.amountNumber, this.fromAsset.decimals) }).then(function () {
        self.confirmOpen = false
        self.fromAmount = ''
        return self.loadBalances()
      }).then(function () {
        try { uni.showToast({ title: self.localizedText('兌換成功', 'Swap successful'), icon: 'success', duration: 1600 }) } catch (e) {}
      }).catch(function (error) {
        self.swapError = (error && error.message) || self.localizedText('兌換失敗，請稍後再試。', 'Swap failed. Please try again later.')
      }).finally(function () {
        self.submitting = false
        try { document.body.style.overflow = '' } catch (e) {}
      })
    },
    formatAmount: function (value, digits) {
      return formatTruncatedAmount(value, digits, { minimumFractionDigits: digits > 2 ? 0 : 2 })
    },
    formatRate: function (value) {
      var n = Number(value || 0)
      if (n >= 1000) return n.toLocaleString('en-GB', { maximumFractionDigits: 2 })
      if (n >= 1) return n.toLocaleString('en-GB', { maximumFractionDigits: 4 })
      return n.toLocaleString('en-GB', { maximumFractionDigits: 8 })
    },
    trimNumber: function (value, digits) {
      return trimTruncatedNumber(value, digits)
    }
  }
}
</script>

<style>
@import url("../../static/previews/shared/marble-bg.css");
@import url("../../static/previews/nc2c/css/preview-entry.css");

.swap-top-logo, .swap-top-bell { align-items: center; border-radius: 999px; display: flex; height: 40px; justify-content: center; width: 40px; }
.swap-top-logo img { height: 40px; object-fit: contain; width: 40px; }
.swap-top-back { background: rgba(255,255,255,.34); color: #2f73cd; font-size: 34px; font-weight: 300; line-height: 1; text-decoration: none; }
.swap-top-bell img, .swap-nav-icon { height: 24px; object-fit: contain; width: 24px; }
.swap-panel, .swap-rate-card { background: linear-gradient(145deg, rgba(255,255,255,.97), rgba(248,252,255,.82) 54%, rgba(236,249,252,.72)); border: 1px solid rgba(255,255,255,.92); border-radius: 28px; box-shadow: 0 20px 42px rgba(40,88,142,.1), inset 0 1px 0 rgba(255,255,255,.98); }
.swap-panel { overflow: hidden; padding: 24px 22px 28px; position: relative; }
.swap-panel__glow { background: radial-gradient(circle at 12% 0%, rgba(255,255,255,.96), transparent 34%), radial-gradient(circle at 92% 100%, rgba(187,231,244,.42), transparent 38%); inset: 0; pointer-events: none; position: absolute; }
.swap-panel > *:not(.swap-panel__glow) { position: relative; z-index: 1; }
.swap-panel__head { align-items: flex-start; color: #6d7f94; display: flex; font-size: 16px; justify-content: space-between; margin-bottom: 12px; }
.swap-all-btn { align-self: flex-end; background: linear-gradient(180deg, rgba(250,253,255,.98), rgba(232,241,255,.9)); border: 1px solid rgba(126,166,232,.42); border-radius: 999px; box-shadow: inset 0 1px 0 rgba(255,255,255,.94), 0 8px 18px rgba(65,107,237,.07); color: #416bed; font-size: 14px; font-weight: 850; letter-spacing: .02em; min-width: 50px; padding: 8px 14px; transform: translateY(12px); }
.swap-asset-select { align-items: center; background: rgba(255,255,255,.82); border: 1px solid rgba(207,224,238,.92); border-radius: 999px; box-shadow: 0 8px 18px rgba(33,79,131,.06), inset 0 1px 0 rgba(255,255,255,.96); color: #16293f; display: inline-flex; flex: 0 0 auto; gap: 8px; min-height: 42px; min-width: 112px; padding: 5px 12px 5px 6px; transition: transform .16s ease, box-shadow .16s ease, border-color .16s ease; }
.swap-asset-select:active { transform: scale(.985); }
.swap-asset-select img { border-radius: 999px; box-shadow: 0 4px 10px rgba(33,79,131,.08); height: 30px; width: 30px; }
.swap-asset-select strong { font-size: 19px; font-weight: 850; letter-spacing: -.02em; line-height: 1; }
.swap-asset-select__chevron { border-bottom: 2px solid #17263d; border-right: 2px solid #17263d; display: inline-block; height: 8px; margin-left: 1px; margin-top: -3px; transform: rotate(45deg); width: 8px; }
.swap-amount-field { align-items: center; background: linear-gradient(180deg, rgba(255,255,255,.68), rgba(250,253,255,.46)); border: 1px solid rgba(205,223,237,.88); border-radius: 18px; box-shadow: inset 0 1px 0 rgba(255,255,255,.9); display: flex; gap: 8px; margin-top: 18px; min-height: 72px; padding: 8px 11px 8px 15px; }
.swap-amount-field input { background: transparent; border: 0; color: #071633; flex: 1 1 auto; font-family: Space Grotesk, Manrope, sans-serif; font-size: 32px; font-weight: 650; letter-spacing: -.045em; line-height: 1; min-width: 0; outline: 0; overflow: hidden; text-overflow: clip; width: 100%; }
.swap-amount-field input::placeholder { color: rgba(22,41,63,.52); }
.swap-balance { color: #738397; font-size: 14px; margin-top: 12px; }
.swap-balance button { color: #416bed; font-weight: 750; }
.swap-balance--muted { margin-top: 10px; }
.swap-note { align-items: flex-start; color: #738397; display: flex; font-size: 12px; gap: 8px; line-height: 1.45; margin-top: 18px; }
.swap-flip-btn { align-items: center; background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(244,249,255,.94)); border: 1px solid rgba(205,224,242,.82); border-radius: 999px; box-shadow: 0 12px 28px rgba(33,79,131,.14), inset 0 0 0 6px rgba(244,249,255,.9); color: #416bed; display: flex; font-size: 34px; font-weight: 800; height: 64px; justify-content: center; margin: -18px auto -18px; position: relative; width: 64px; z-index: 5; }
.swap-rate-card { align-items: center; display: grid; column-gap: 14px; grid-template-areas: "icon label info" "icon value info"; grid-template-columns: 42px minmax(0, 1fr) auto; row-gap: 4px; margin-top: 24px; min-height: 104px; overflow: hidden; padding: 22px 22px; position: relative; }
.swap-rate-card__shine { background: radial-gradient(circle at 15% 10%, rgba(255,255,255,.95), transparent 34%); inset: 0; pointer-events: none; position: absolute; }
.swap-rate-card > *:not(.swap-rate-card__shine) { position: relative; z-index: 1; }
.swap-rate-card__icon { align-items: center; background: linear-gradient(145deg, #ecf2ff, #dfe7ff); border-radius: 11px; box-shadow: inset 0 1px 0 rgba(255,255,255,.9); display: flex; grid-area: icon; height: 36px; justify-content: center; width: 36px; }
.swap-rate-card__icon img { height: 22px; width: 22px; }
.swap-rate-card span { color: #647789; font-size: 15px; }
.swap-rate-card__label { align-self: end; grid-area: label; line-height: 1.25; min-width: 0; }
.swap-rate-card__value { align-self: start; color: #16293f; font-size: 14px; font-weight: 750; grid-area: value; justify-self: start; line-height: 1.3; min-width: 0; overflow-wrap: anywhere; }
.swap-rate-card__info { color: #738397 !important; font-size: 18px !important; grid-area: info; }
	.swap-preview-btn { background: linear-gradient(135deg, #6f86ff 0%, #416bed 100%); border: 0; border-radius: 999px; box-shadow: 0 20px 34px rgba(65,107,237,.27); color: #fff; font-family: Space Grotesk, Manrope, sans-serif; font-size: 17px; font-weight: 850; height: 62px; margin-top: 24px; width: 100%; }
	.swap-preview-btn:disabled { cursor: not-allowed; filter: grayscale(.25); opacity: .68; }
	.swap-error { background: rgba(255,241,240,.92); border: 1px solid rgba(239,81,72,.18); border-radius: 16px; color: #ef5148; font-size: 13px; font-weight: 700; line-height: 1.45; margin: 18px 2px -6px; padding: 11px 14px; text-align: center; }
	.swap-picker { inset: 0; position: fixed; z-index: 10080; }
.swap-picker__backdrop { background: rgba(9,28,48,.38); backdrop-filter: blur(8px); inset: 0; position: absolute; }
.swap-picker__sheet { background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(239,249,255,.96)); border: 1px solid rgba(255,255,255,.88); border-radius: 28px 28px 0 0; bottom: 0; box-shadow: 0 -18px 38px rgba(9,28,48,.16); left: 50%; max-height: 72vh; max-width: 32rem; overflow-y: auto; padding: 16px; position: absolute; transform: translateX(-50%); width: 100%; }
.swap-picker__head, .swap-picker__item { align-items: center; display: flex; }
.swap-picker__head { justify-content: space-between; padding: 4px 4px 12px; }
.swap-picker__head strong { color: #16293f; font-size: 17px; }
.swap-picker__head button { color: #617588; font-size: 28px; height: 36px; width: 36px; }
.swap-picker__item { background: rgba(255,255,255,.72); border: 1px solid rgba(216,229,240,.72); border-radius: 18px; gap: 13px; margin-top: 9px; padding: 12px; text-align: left; width: 100%; }
	.swap-picker__item img { height: 42px; width: 42px; }
	.swap-picker__item span { display: grid; flex: 1; gap: 3px; min-width: 0; }
	.swap-picker__item strong { color: #16293f; font-size: 18px; }
	.swap-picker__item small, .swap-picker__item em { color: #738397; font-size: 12px; font-style: normal; }
	.swap-confirm { align-items: center; display: flex; inset: 0; justify-content: center; padding: 22px; position: fixed; z-index: 10090; }
	.swap-confirm__backdrop { background: rgba(9,28,48,.42); backdrop-filter: blur(10px); inset: 0; position: absolute; }
	.swap-confirm__card { background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(241,248,255,.96)); border: 1px solid rgba(255,255,255,.9); border-radius: 28px; box-shadow: 0 24px 58px rgba(9,28,48,.2); max-width: 390px; padding: 28px 22px 20px; position: relative; text-align: center; width: 100%; }
	.swap-confirm__close { color: #75849b; font-size: 28px; height: 38px; position: absolute; right: 12px; top: 10px; width: 38px; }
	.swap-confirm__icon { align-items: center; background: linear-gradient(135deg, #b687ff, #7a3fd2); border-radius: 22px; box-shadow: 0 16px 28px rgba(122,63,210,.22), inset 0 1px 0 rgba(255,255,255,.38); display: flex; height: 62px; justify-content: center; margin: 0 auto 14px; width: 62px; }
	.swap-confirm__icon img { height: 32px; width: 32px; }
	.swap-confirm__card h2 { color: #121a38; font-family: Space Grotesk, Manrope, sans-serif; font-size: 23px; font-weight: 900; letter-spacing: -.04em; }
	.swap-confirm__card p { color: #75849b; font-size: 14px; line-height: 1.45; margin: 8px auto 18px; max-width: 310px; }
	.swap-confirm__quote { background: rgba(255,255,255,.72); border: 1px solid rgba(214,224,238,.8); border-radius: 20px; display: grid; gap: 0; overflow: hidden; text-align: left; }
	.swap-confirm__quote div { align-items: center; display: flex; gap: 16px; justify-content: space-between; min-height: 48px; padding: 0 16px; }
	.swap-confirm__quote div + div { border-top: 1px solid rgba(214,224,238,.72); }
	.swap-confirm__quote span { color: #738397; font-size: 13px; font-weight: 650; }
	.swap-confirm__quote strong { color: #111a38; font-size: 14px; font-weight: 850; text-align: right; }
	.swap-confirm__primary, .swap-confirm__secondary { align-items: center; border-radius: 999px; display: flex; font-size: 16px; font-weight: 850; height: 52px; justify-content: center; margin-top: 14px; width: 100%; }
	.swap-confirm__primary { background: linear-gradient(180deg, #5f86f1, #2f57c8); box-shadow: 0 12px 24px rgba(51,86,197,.22); color: #fff; }
	.swap-confirm__secondary { background: rgba(255,255,255,.86); border: 1px solid #cddcff; color: #416bd8; margin-top: 10px; }
	.swap-confirm__primary:disabled, .swap-confirm__secondary:disabled { cursor: not-allowed; opacity: .62; }
	@media (max-width: 374px) { .swap-panel { padding: 21px 18px 24px; } .swap-asset-select { min-width: 102px; padding-right: 10px; } .swap-asset-select img { height: 28px; width: 28px; } .swap-asset-select strong { font-size: 17px; } .swap-asset-select__chevron { height: 7px; width: 7px; } .swap-amount-field { padding-left: 12px; } .swap-amount-field input { font-size: 28px; } .swap-rate-card { grid-template-areas: "icon label" "icon value"; grid-template-columns: 38px minmax(0, 1fr); } .swap-rate-card__info { display: none; } }
</style>
