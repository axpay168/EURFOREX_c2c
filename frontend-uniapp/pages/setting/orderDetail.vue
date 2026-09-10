<template>
  <div>
    <header class="fixed top-0 w-full border-b border-primary/10 bg-white/75 backdrop-blur-3xl shadow-[0_12px_32px_rgba(33,79,131,0.08)] flex justify-between items-center px-6 h-14 z-50">
      <a class="order-top-logo" href="#/pages/setting/myTask" @click="backGo($event, '#/pages/setting/myTask')" :aria-label="localizedText('返回訂單列表', 'Back to orders')">
        <img :src="logoSrc" alt="EURFOREX" />
      </a>
      <div class="font-headline text-lg font-bold text-on-surface">{{ localizedText('交易詳情', 'Transaction details') }}</div>
      <a class="order-top-bell" href="#/pages/index/serviceCenter" :aria-label="localizedText('客服中心', 'Support')">
        <img :src="profileIcons.bell" alt="" aria-hidden="true" />
      </a>
    </header>

    <main class="order-detail-page mx-auto max-w-lg px-4 pt-20 pb-10">
      <LoadingInlineSpinner v-if="loading && !order" :aria-label="localizedText('訂單詳情載入', 'Order details loading')" />

      <section v-else-if="!order" class="order-receipt-card order-receipt-card--empty">
        <div class="order-result-icon order-result-icon--unknown">
          <img :src="profileIcons.records" alt="" aria-hidden="true" />
        </div>
        <h2>{{ localizedText('找不到此訂單', 'Order not found') }}</h2>
        <p>{{ errorMessage || localizedText('此訂單可能已不存在，請返回訂單列表重新選擇。', 'This order may not exist. Please return to the order list and choose again.') }}</p>
        <a class="order-close-btn" href="#/pages/setting/myTask">{{ localizedText('返回訂單列表', 'Back to order list') }}</a>
      </section>

      <section v-else class="order-receipt-card">
        <div class="order-result-icon" :class="order.resultClass">
          <img :src="order.icon" alt="" aria-hidden="true" />
          <span>{{ order.sideLabelShort }}</span>
        </div>

        <div class="order-main-amount" :class="order.amountClass">{{ order.mainAmount }}</div>
        <div class="order-status-line" :class="order.statusClass">
          <span aria-hidden="true">{{ order.statusIcon }}</span>
          <strong>{{ order.statusText }}</strong>
        </div>

        <div class="order-divider"></div>

        <dl class="order-detail-list">
          <div>
            <dt>{{ localizedText('交易時間', 'Transaction time') }}</dt>
            <dd>{{ order.transactionTime }}</dd>
          </div>
          <div>
            <dt>{{ localizedText('訂單編號', 'Order no.') }}</dt>
            <dd class="mono">{{ order.orderNo }}</dd>
          </div>
          <div>
            <dt>{{ localizedText('交易數量', 'Transaction amount') }}</dt>
            <dd>{{ order.assetAmount }}</dd>
          </div>
          <div>
            <dt>{{ localizedText('匯率', 'Exchange rate') }}</dt>
            <dd>{{ order.rateLine }}</dd>
          </div>
          <div>
            <dt>{{ localizedText('手續費', 'Fee') }}</dt>
            <dd class="order-fee-value">{{ order.feeLine }}</dd>
          </div>
          <div>
            <dt>{{ localizedText('實際數量', 'Actual quantity') }}</dt>
            <dd>{{ order.actualQuantity }}</dd>
          </div>
        </dl>

        <div class="order-divider"></div>

        <div class="order-received-row" :class="order.receivedClass">
          <span>{{ order.receivedLabel }}</span>
          <strong>{{ order.receivedAmount }}</strong>
        </div>
      </section>

      <div v-if="order" class="order-actions">
        <button v-if="order.canCancel" type="button" class="order-secondary-btn" :disabled="loading" @click="cancelOrder">
          {{ loading ? localizedText('處理中...', 'Processing...') : localizedText('取消訂單', 'Cancel order') }}
        </button>
        <a class="order-close-btn" href="#/pages/setting/myTask">{{ localizedText('關閉', 'Close') }}</a>
      </div>
    </main>
  </div>
</template>

<script>
import { brandMarkLogo } from '@/assets/images'
import profileBellIcon from '@/static/icons/profile/bell.svg'
import profileRecordsIcon from '@/static/icons/profile/records-white.svg'
import profileTopupIcon from '@/static/icons/profile/top-up-white.svg'
import profileSellIcon from '@/static/icons/profile/sell-white.svg'
import { userApi } from '@/utils/api'

var BODY_CLASSES = ['nc2c-page', 'nc2c-page--order-detail', 'font-body', 'antialiased', 'min-h-screen', 'bg-background', 'text-on-surface', 'pb-8']

export default {
  name: 'OrderDetailH5',
  data: function () {
    return { logoSrc: brandMarkLogo, profileIcons: { bell: profileBellIcon, records: profileRecordsIcon }, orderId: '', loading: false, errorMessage: '', remoteOrder: null }
  },
  computed: {
    order: function () { return this.remoteOrder || null }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) document.body.classList.add(BODY_CLASSES[i])
      document.body.setAttribute('data-nc2c-page', 'order-detail')
      document.body.setAttribute('data-nc2c-locked', 'true')
    } catch (e) {}
    this.orderId = this.getOrderIdFromHash()
    this.loadSharedScript('/static/previews/shared/marble-bg.js', 'eurforexMarbleBgJs')
    this.loadSharedScript('/static/previews/shared/back-nav.js', 'eurnyseBackNav')
    this.fetchOrderDetail()
  },
  beforeDestroy: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) document.body.classList.remove(BODY_CLASSES[i])
      document.body.removeAttribute('data-nc2c-page')
      document.body.removeAttribute('data-nc2c-locked')
    } catch (e) {}
  },
  methods: {
    getOrderIdFromHash: function () {
      try {
        var hash = window.location.hash || ''
        var query = hash.indexOf('?') >= 0 ? hash.slice(hash.indexOf('?') + 1) : ''
        var params = new URLSearchParams(query)
        var id = params.get('id')
        return id ? String(id).trim() : ''
      } catch (e) { return '' }
    },
    backGo: function (event, fallback) {
      if (window.EurnyseBack && typeof window.EurnyseBack.go === 'function') {
        if (event && event.preventDefault) event.preventDefault()
        window.EurnyseBack.go(fallback)
      }
    },
    fetchOrderDetail: function () {
      if (!this.orderId || !/^\d+$/.test(this.orderId)) return
      var self = this
      this.loading = true
      this.errorMessage = ''
      userApi.orderDetail(this.orderId).then(function (data) {
        self.remoteOrder = self.mapApiOrder(data.order || {})
      }).catch(function (error) {
        self.errorMessage = (error && error.message) || self.localizedText('載入訂單失敗', 'Failed to load order')
      }).finally(function () { self.loading = false })
    },
    mapApiOrder: function (item) {
      var side = String(item.side || '').toLowerCase()
      var status = String(item.status || '').toLowerCase()
      var isBuy = side === 'buy'
      var amount = Number(item.amount || 0)
      var total = Number(item.total_amount || 0)
      var price = Number(item.price || 0)
      var fiat = String(item.fiat_code || 'EUR').toUpperCase()
      var asset = String(item.asset_code || 'USDT').toUpperCase()
      var statusMeta = this.statusMeta(status)
      var counterpartyName = String(item.counterparty_display_name || item.counterparty_username || '').trim()
      var feeRate = Number(item.fee_rate || 0.005) || 0.005
      var fee = item.fee_amount != null && String(item.fee_amount).trim() !== '' ? Number(item.fee_amount || 0) : amount * feeRate
      var actual = Math.max(0, amount - fee)
      if (item.actual_amount != null && String(item.actual_amount).trim() !== '') actual = Number(item.actual_amount || actual)
      var mainAmount = isBuy ? ('+' + this.formatAmount(amount, 2) + ' ' + asset) : ('+' + this.formatAmount(total, 2) + ' ' + fiat)
      var receivedAmount = isBuy ? (this.formatAmount(amount, 2) + ' ' + asset) : (this.formatAmount(total, 2) + ' ' + fiat)
      return {
        realId: item.id,
        orderNo: item.order_no || String(item.id || '-'),
        icon: isBuy ? profileTopupIcon : profileSellIcon,
        sideLabelShort: isBuy ? 'BUY' : 'SELL',
        resultClass: isBuy ? 'order-result-icon--buy' : 'order-result-icon--sell',
        amountClass: statusMeta.amountClass,
        mainAmount: mainAmount,
        statusText: statusMeta.text,
        statusIcon: statusMeta.icon,
        statusClass: statusMeta.className,
        transactionTime: item.completed_at || item.updated_at || item.created_at || '-',
        assetAmount: this.formatAmount(amount, 2) + ' ' + asset,
        rateLine: '1 ' + asset + ' ≈ ' + this.formatAmount(price, 4) + ' ' + fiat,
        feeLine: '-' + this.formatAmount(fee, 2) + ' ' + asset,
        actualQuantity: this.formatAmount(actual || amount, 2) + ' ' + asset,
        counterparty: counterpartyName || (isBuy ? this.localizedText('賣家 #-', 'Seller #-') : this.localizedText('買家 #-', 'Buyer #-')),
        methodLabel: isBuy ? this.localizedText('付款方式', 'Payment method') : this.localizedText('收款方式', 'Settlement method'),
        method: this.paymentMethodLabel(item.payment_method_summary),
        receivedLabel: status === 'completed' ? this.localizedText('交易已到帳', 'Transaction received') : this.localizedText('預計到帳', 'Estimated received'),
        receivedAmount: receivedAmount,
        receivedClass: statusMeta.receivedClass,
        canCancel: ['pending_payment', 'paid_pending_release', 'disputed'].indexOf(status) !== -1
      }
    },
    statusMeta: function (status) {
      if (status === 'completed') return { text: this.localizedText('交易成功', 'Transaction successful'), icon: '✓', className: 'order-status-line--success', amountClass: 'order-main-amount--success', receivedClass: 'order-received-row--success' }
      if (status === 'cancelled') return { text: this.localizedText('交易已取消', 'Transaction canceled'), icon: '×', className: 'order-status-line--cancelled', amountClass: 'order-main-amount--muted', receivedClass: 'order-received-row--muted' }
      if (status === 'disputed') return { text: this.localizedText('申訴處理中', 'Appeal in progress'), icon: '!', className: 'order-status-line--warning', amountClass: 'order-main-amount--warning', receivedClass: 'order-received-row--warning' }
      if (status === 'paid_pending_release') return { text: this.localizedText('等待放行', 'Pending release'), icon: '…', className: 'order-status-line--pending', amountClass: 'order-main-amount--pending', receivedClass: 'order-received-row--pending' }
      return { text: this.localizedText('等待付款', 'Pending payment'), icon: '…', className: 'order-status-line--pending', amountClass: 'order-main-amount--pending', receivedClass: 'order-received-row--pending' }
    },
    cancelOrder: function () {
      if (!this.remoteOrder || !this.remoteOrder.realId || !this.remoteOrder.canCancel) return
      if (!window.confirm(this.localizedText('確定取消此訂單？', 'Are you sure to cancel this order?'))) return
      var self = this
      this.loading = true
      userApi.cancelOrder(this.remoteOrder.realId, '使用者取消訂單').then(function () {
        return self.fetchOrderDetail()
      }).catch(function (error) {
        alert((error && error.message) || self.localizedText('取消訂單失敗', 'Failed to cancel order'))
      }).finally(function () { self.loading = false })
    },
    paymentMethodLabel: function (summary) {
      var s = String(summary || '').trim()
      if (!s || s === '平台撮合') return this.localizedText('平台撮合', 'Platform matching')
      return s
    },
    formatAmount: function (value, digits) {
      var n = Number(value || 0)
      return n.toLocaleString('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits })
    }
  }
}
</script>

<style>
@import url("../../static/previews/shared/marble-bg.css");
@import url("../../static/previews/nc2c/css/preview-entry.css");

.order-top-logo, .order-top-bell { align-items: center; border-radius: 999px; display: flex; height: 40px; justify-content: center; width: 40px; }
.order-top-logo img { height: 40px; object-fit: contain; width: 40px; }
.order-top-bell img { height: 22px; object-fit: contain; width: 22px; }
.order-receipt-card { background: linear-gradient(145deg, rgba(255,255,255,.96), rgba(247,252,255,.86)); border: 1px solid rgba(255,255,255,.9); border-radius: 28px; box-shadow: 0 18px 38px rgba(40,88,142,.1), inset 0 1px 0 rgba(255,255,255,.96); overflow: hidden; padding: 42px 24px 22px; text-align: center; }
.order-receipt-card--empty { padding-bottom: 28px; }
.order-receipt-card--empty h2 { color: #16293f; font-size: 22px; font-weight: 800; margin-top: 14px; }
.order-receipt-card--empty p { color: #738397; line-height: 1.6; margin: 10px 0 20px; }
.order-result-icon { align-items: center; border: 7px solid rgba(255,255,255,.92); border-radius: 999px; box-shadow: 0 14px 28px rgba(40,88,142,.14); display: inline-flex; height: 88px; justify-content: center; position: relative; width: 88px; }
.order-result-icon img { height: 46px; object-fit: contain; width: 46px; }
.order-result-icon span { background: rgba(255,255,255,.28); border-radius: 999px; bottom: 5px; color: #fff; font-size: 12px; font-weight: 800; left: 50%; letter-spacing: .04em; padding: 2px 8px; position: absolute; transform: translateX(-50%); }
.order-result-icon--sell { background: linear-gradient(145deg, #ff9b9f, #e45d65); }
.order-result-icon--buy { background: linear-gradient(145deg, #72d3bd, #2f9c91); }
.order-result-icon--unknown { background: linear-gradient(145deg, #8fd5ff, #4d87df); }
.order-main-amount { color: #071633; font-family: Space Grotesk, Manrope, sans-serif; font-size: clamp(34px, 8.2vw, 44px); font-weight: 750; letter-spacing: -0.04em; line-height: 1.05; margin-top: 22px; overflow-wrap: anywhere; }
.order-main-amount--muted { color: #738397; }
.order-main-amount--warning { color: #ad741f; }
.order-main-amount--pending { color: #2f73cd; }
.order-status-line { align-items: center; display: inline-flex; font-size: 16px; gap: 8px; justify-content: center; margin-top: 14px; }
.order-status-line span { align-items: center; border: 1.5px solid currentColor; border-radius: 999px; display: inline-flex; font-size: 13px; font-weight: 900; height: 22px; justify-content: center; line-height: 1; width: 22px; }
.order-status-line--success { color: #3fa36a; }
.order-status-line--cancelled { color: #d94c5b; }
.order-status-line--warning { color: #bd8427; }
.order-status-line--pending { color: #416bed; }
.order-divider { background: linear-gradient(90deg, transparent, rgba(145,179,207,.42), transparent); height: 1px; margin: 34px 0 24px; }
.order-detail-list { display: grid; gap: 22px; margin: 0; text-align: left; }
.order-detail-list div { align-items: start; display: grid; gap: 18px; grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr); }
.order-detail-list dt { color: #738397; font-size: 14px; }
.order-detail-list dd { color: #16293f; font-size: 14px; font-weight: 650; margin: 0; min-width: 0; overflow-wrap: anywhere; text-align: right; }
.order-detail-list dd.order-fee-value { color: #d94c5b; }
.order-detail-list dd.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 12px; }
.order-received-row { align-items: center; background: linear-gradient(90deg, rgba(238,250,246,.95), rgba(232,248,244,.86)); border: 1px solid rgba(202,232,223,.72); border-radius: 14px; display: flex; gap: 12px; justify-content: space-between; padding: 14px 16px; text-align: left; }
.order-received-row span { color: #16293f; font-weight: 800; }
.order-received-row strong { color: #3fa36a; font-size: 22px; font-weight: 850; text-align: right; }
.order-received-row--muted { background: rgba(241,246,250,.82); }
.order-received-row--muted strong { color: #738397; }
.order-received-row--warning strong { color: #bd8427; }
.order-received-row--pending strong { color: #416bed; }
.order-actions { display: grid; gap: 12px; margin-top: 16px; }
.order-close-btn, .order-secondary-btn { align-items: center; border-radius: 999px; display: flex; font-family: Space Grotesk, Manrope, sans-serif; font-size: 17px; font-weight: 800; height: 56px; justify-content: center; text-decoration: none; width: 100%; }
.order-close-btn { background: linear-gradient(135deg, #6687ff 0%, #416bed 100%); box-shadow: 0 18px 32px rgba(65,107,237,.24); color: #fff; }
.order-secondary-btn { background: #fff3f5; border: 1px solid #f3c2ca; color: #b42336; }
.order-secondary-btn:disabled { opacity: .65; }
@media (max-width: 374px) { .order-receipt-card { padding-left: 20px; padding-right: 20px; } .order-detail-list div { gap: 10px; } .order-received-row strong { font-size: 18px; } }
</style>
