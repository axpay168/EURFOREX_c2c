<template>
  <div class="orders-page-v2">
    <header class="orders-v2-header fixed top-0 left-0 w-full z-50">
      <img class="orders-v2-logo" :src="logoSrc" :alt="localizedText('EURFOREX 標誌', 'EURFOREX logo')" />
      <div class="orders-v2-title font-headline">{{ localizedText('訂單', 'Orders') }}</div>
      <a class="orders-v2-bell" href="#/pages/index/serviceCenter" :aria-label="localizedText('通知', 'Notifications')">
        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">notifications</span>
      </a>
    </header>

    <main class="orders-v2-main max-w-3xl mx-auto pb-32 sm:pb-36">
      <section class="orders-v2-type-filter" :aria-label="localizedText('訂單類型', 'Order types')">
        <button
          v-for="tab in typeTabs"
          :key="tab.key"
          type="button"
          class="orders-v2-chip orders-v2-chip--type"
          :class="typeFilter === tab.key ? 'is-active' : ''"
          @click="typeFilter = tab.key"
        >{{ localizedText(tab.label, tab.labelEn) }}</button>
      </section>

      <section class="orders-v2-status-row" :aria-label="localizedText('訂單狀態', 'Order status')">
        <div class="orders-v2-status-filter">
          <button
            v-for="status in statusTabs"
            :key="status.key"
            type="button"
            class="orders-v2-chip orders-v2-chip--status"
            :class="statusFilter === status.key ? 'is-active' : ''"
            @click="statusFilter = status.key"
          >{{ localizedText(status.label, status.labelEn) }}</button>
        </div>
        <button type="button" class="orders-v2-calendar" :aria-label="localizedText('日期篩選', 'Date filter')">
          <span class="material-symbols-outlined">calendar_month</span>
        </button>
      </section>

      <LoadingInlineSpinner v-if="loading" :aria-label="localizedText('訂單載入', 'Loading orders')" />
      <p v-else-if="errorMessage" class="orders-v2-message orders-v2-message--error">{{ errorMessage }}</p>
      <p v-else-if="!visibleOrders.length" class="orders-v2-message">{{ $t('phrases.目前沒有符合條件的訂單。') }}</p>

      <section v-else class="orders-v2-list" :aria-label="localizedText('訂單列表', 'Order list')">
        <a
          v-for="(order, index) in visibleOrders"
          :key="order.realId || order.orderNo"
          class="orders-v2-item"
          :class="index === visibleOrders.length - 1 ? 'is-last' : ''"
          :data-order-status="order.status"
          :href="'#/pages/setting/orderDetail?id=' + encodeURIComponent(order.realId)"
        >
          <img class="orders-v2-action-icon" :src="order.iconSrc" :alt="order.typeLabel" loading="eager" decoding="async" />
          <div class="orders-v2-item-main">
            <div class="orders-v2-row orders-v2-row--top">
              <h2 class="orders-v2-item-title font-headline">{{ order.title }}</h2>
              <span class="orders-v2-badge" :class="order.badgeClass">{{ order.statusLabel }}</span>
            </div>
            <div class="orders-v2-row orders-v2-row--detail">
              <div class="orders-v2-meta-block">
                <div class="orders-v2-meta">{{ order.meta }}</div>
                <div class="orders-v2-time orders-v2-time--left">{{ order.time }}</div>
              </div>
              <div class="orders-v2-right-copy">
                <div v-if="order.resultAmount" class="orders-v2-result" :class="order.resultClass">{{ order.resultAmount }}</div>
              </div>
              <span class="orders-v2-chevron material-symbols-outlined">chevron_right</span>
            </div>
          </div>
        </a>
      </section>
    </main>

    <nav
      class="eurforex-home-bottom-nav fixed bottom-0 left-0 w-full z-50 rounded-t-2xl bg-white/82 backdrop-blur-lg shadow-[0px_-8px_24px_rgba(33,79,131,0.08)] font-['Manrope']"
      :aria-label="localizedText('主頁底部導航', 'Home bottom navigation')"
    >
      <div class="flex justify-around items-center h-20 px-4 pb-safe">
        <a class="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary-dim transition-all" href="#/pages/index/index"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">home</span><span class="text-[11px] font-semibold tracking-wide mt-0.5">{{ localizedText('主頁', 'Home') }}</span></a>
        <a class="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary-dim transition-all" href="#/pages/index/hall"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">swap_horizontal_circle</span><span class="text-[11px] font-semibold tracking-wide mt-0.5">{{ localizedText('交易大廳', 'Trading Hall') }}</span></a>
        <button class="flex flex-col items-center justify-center text-primary-dim bg-primary-container/70 rounded-xl px-4 py-2 transition-all active:scale-90"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">receipt_long</span><span class="text-[11px] font-semibold tracking-wide mt-0.5">{{ localizedText('訂單', 'Orders') }}</span></button>
        <a class="flex flex-col items-center justify-center text-on-surface-variant px-3 py-1 hover:text-primary-dim transition-all" href="#/pages/setting/user"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">person</span><span class="text-[11px] font-semibold tracking-wide mt-0.5">{{ localizedText('個人中心', 'Profile') }}</span></a>
      </div>
    </nav>
  </div>
</template>

<script>
import { userApi } from '@/utils/api'
import { brandMarkLogo, orderBuyIcon, orderSellIcon } from '@/assets/images'

var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--orders",
  "font-body",
  "antialiased",
  "min-h-screen",
  "bg-background",
  "text-on-surface",
  "pb-32"
];

export default {
  name: "OrdersH5",
  data: function () {
    return {
      logoSrc: brandMarkLogo,
      typeFilter: "all",
      statusFilter: "all",
      typeTabs: [
        { key: "all", label: "全部", labelEn: "All" },
        { key: "buy", label: "買入", labelEn: "Buy" },
        { key: "sell", label: "賣出", labelEn: "Sell" },
        { key: "swap", label: "兌換", labelEn: "Swap" }
      ],
      statusTabs: [
        { key: "all", label: "全部狀態", labelEn: "All status" },
        { key: "completed", label: "已完成", labelEn: "Completed" },
        { key: "progress", label: "處理中", labelEn: "Processing" },
        { key: "failed", label: "失敗", labelEn: "Failed" }
      ],
      orders: [],
      loading: false,
      errorMessage: ""
    };
  },
  computed: {
    visibleOrders: function () {
      var self = this;
      return this.orders.filter(function (order) {
        var typeOk = self.typeFilter === "all" || order.type === self.typeFilter;
        var statusOk = self.statusFilter === "all" || order.statusGroup === self.statusFilter;
        return typeOk && statusOk;
      });
    }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) document.body.classList.add(BODY_CLASSES[i]);
      document.body.setAttribute("data-nc2c-page", "orders");
      document.body.setAttribute("data-nc2c-locked", "true");
    } catch (e) {}
    this.applyFilterFromHash();
    this.fetchOrders();
  },
  beforeDestroy: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) document.body.classList.remove(BODY_CLASSES[i]);
      document.body.removeAttribute("data-nc2c-page");
      document.body.removeAttribute("data-nc2c-locked");
    } catch (e) {}
  },
  methods: {
    applyFilterFromHash: function () {
      try {
        var hash = window.location.hash || "";
        var q = hash.indexOf("?");
        if (q === -1) return;
        var params = new URLSearchParams(hash.slice(q + 1));
        var f = params.get("filter");
        var legacy = { progress: "progress", completed: "completed", cancelled: "failed", appeal: "progress" };
        if (f && legacy[f]) this.statusFilter = legacy[f];
      } catch (e) {}
    },
    fetchOrders: function () {
      var self = this;
      this.loading = true;
      this.errorMessage = "";
      userApi
        .orders("?page=1&page_size=100")
        .then(function (data) {
          var rows = (data && data.items) || [];
          self.orders = rows.map(function (item) { return self.mapApiOrder(item); });
        })
        .catch(function (error) {
          self.orders = [];
          self.errorMessage = (error && error.message) || self.localizedText("載入訂單失敗", "Failed to load orders");
        })
        .finally(function () { self.loading = false; });
    },
    mapApiOrder: function (item) {
      var status = String(item.status || "");
      var side = String(item.side || "");
      var type = side === "buy" ? "buy" : "sell";
      var asset = item.asset_code || "USDT";
      var fiat = item.fiat_code || "EUR";
      var amount = this.formatAmount(item.amount, 2);
      var total = this.formatAmount(item.total_amount, 2);
      var time = item.completed_at || item.updated_at || item.created_at || "—";
      var isBuy = type === "buy";
      return {
        realId: item.id || "",
        orderNo: item.order_no || String(item.id || "—"),
        type: type,
        typeLabel: this.localizedText(isBuy ? "買入" : "賣出", isBuy ? "Buy" : "Sell"),
        statusGroup: this.statusGroup(status),
        statusLabel: this.statusLabel(status),
        badgeClass: this.badgeClass(status),
        iconSrc: isBuy ? orderBuyIcon : orderSellIcon,
        title: this.localizedText(isBuy ? "買入 " : "賣出 ", isBuy ? "Buy " : "Sell ") + asset,
        meta: status === "disputed" ? this.localizedText("憑證審核中", "Proof review in progress") : this.localizedText(isBuy ? "買入訂單" : "賣出訂單", isBuy ? "Buy order" : "Sell order"),
        primaryAmount: (isBuy ? total + " " + fiat : amount + " " + asset),
        resultAmount: status === "cancelled" ? "" : (isBuy ? "+" + amount + " " + asset : "+" + total + " " + fiat),
        resultClass: status === "cancelled" ? "" : "is-positive",
        time: this.formatDateTime(time)
      };
    },
    statusGroup: function (status) {
      if (status === "completed") return "completed";
      if (status === "cancelled" || status === "failed") return "failed";
      return "progress";
    },
    statusLabel: function (status) {
      var map = {
        pending_payment: this.localizedText("處理中", "Processing"),
        paid_pending_release: this.localizedText("處理中", "Processing"),
        completed: this.localizedText("已完成", "Completed"),
        cancelled: this.localizedText("失敗", "Failed"),
        failed: this.localizedText("失敗", "Failed"),
        disputed: this.localizedText("處理中", "Processing")
      };
      return map[status] || status || this.localizedText("處理中", "Processing");
    },
    badgeClass: function (status) {
      if (status === "completed") return "is-completed";
      if (status === "cancelled" || status === "failed") return "is-failed";
      return "is-processing";
    },
    formatAmount: function (value, digits) {
      return Number(value || 0).toLocaleString("en-GB", { minimumFractionDigits: digits, maximumFractionDigits: digits });
    },
    formatDateTime: function (value) {
      if (!value || value === "—") return "—";
      return String(value).replace("T", " ").slice(0, 16);
    }
  }
};
</script>

<style>
@import url("../../static/previews/nc2c/css/preview-entry.css");

.orders-page-v2 {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 43%, #f7fbff 100%);
  color: #111c3a;
  font-family: Manrope, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.orders-v2-header {
  height: 76px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 30px;
  background: rgba(255, 255, 255, 0.86);
  border-bottom: 1px solid rgba(215, 226, 240, 0.72);
  box-shadow: 0 10px 28px rgba(28, 72, 126, 0.06);
  backdrop-filter: blur(22px);
}

.orders-v2-logo {
  position: absolute;
  left: 32px;
  width: 48px;
  height: 34px;
  object-fit: contain;
}

.orders-v2-title {
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: #111833;
}

.orders-v2-bell {
  position: absolute;
  right: 31px;
  display: inline-flex;
  color: #4c75ff;
  text-decoration: none;
}

.orders-v2-main {
  padding: 99px 22px 130px;
}

.orders-v2-type-filter,
.orders-v2-status-filter {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 8px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.orders-v2-type-filter::-webkit-scrollbar,
.orders-v2-status-filter::-webkit-scrollbar {
  display: none;
}

.orders-v2-type-filter {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0 8px 15px;
}

.orders-v2-status-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 8px 18px;
}

.orders-v2-status-filter {
  flex: 1;
  min-width: 0;
}

.orders-v2-chip {
  height: 42px;
  border: 1px solid #dfe8f5;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.76);
  color: #313c57;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 8px 18px rgba(23, 65, 118, 0.05), inset 0 1px 0 rgba(255,255,255,0.9);
  transition: all 0.16s ease;
}

.orders-v2-chip--type {
  min-width: 0;
  padding: 0 18px;
}

.orders-v2-chip--status {
  flex: 0 0 auto;
  min-width: 112px;
  padding: 0 18px;
}

.orders-v2-chip.is-active {
  color: #2455d6;
  border-color: #8faeff;
  background: linear-gradient(180deg, #eef4ff, #f7fbff);
  box-shadow: 0 10px 22px rgba(60, 104, 220, 0.12), inset 0 1px 0 rgba(255,255,255,0.96);
}

.orders-v2-calendar {
  width: 45px;
  height: 42px;
  flex: 0 0 45px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dfe8f5;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.78);
  color: #66758c;
  box-shadow: 0 8px 18px rgba(23, 65, 118, 0.05);
}

.orders-v2-list {
  border-radius: 27px;
  padding: 14px 10px 14px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(221, 233, 246, 0.9);
  box-shadow: 0 18px 38px rgba(43, 91, 141, 0.09), inset 0 1px 0 rgba(255,255,255,0.92);
  overflow: hidden;
}

.orders-v2-item {
  min-height: 92px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 9px 0 10px 14px;
  color: inherit;
  text-decoration: none;
}

.orders-v2-item:not(.is-last) .orders-v2-item-main {
  border-bottom: 1px solid rgba(219, 228, 240, 0.86);
}

.orders-v2-action-icon {
  width: 58px;
  height: 58px;
  flex: 0 0 58px;
  object-fit: contain;
  filter: drop-shadow(0 10px 14px rgba(48, 86, 142, 0.12));
}

.orders-v2-item-main {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: auto auto;
  column-gap: 10px;
  row-gap: 7px;
  padding: 0 20px 10px 0;
}

.orders-v2-row {
  display: contents;
}

.orders-v2-row--top {
  margin-bottom: 0;
}

.orders-v2-item-title {
  grid-column: 1;
  grid-row: 1;
  min-width: 0;
  font-size: 17px;
  line-height: 1.18;
  font-weight: 850;
  letter-spacing: -0.035em;
  color: #121a38;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.orders-v2-badge {
  grid-column: 2;
  grid-row: 1;
  align-self: start;
  min-width: 88px;
  border-radius: 8px;
  padding: 5px 11px;
  text-align: center;
  font-size: 14px;
  line-height: 1.1;
  font-weight: 600;
}

.orders-v2-badge.is-completed { color: #2ca767; background: #effcf5; border: 1px solid #d7f2e4; }
.orders-v2-badge.is-processing { color: #d99410; background: #fff9ed; border: 1px solid #ffe9bd; }
.orders-v2-badge.is-failed { color: #f05249; background: #fff1f0; border: 1px solid #ffd9d5; }

.orders-v2-row--detail {
  position: relative;
  padding-right: 0;
}

.orders-v2-meta,
.orders-v2-time,
.orders-v2-note {
  color: #78869d;
  line-height: 1.25;
  font-size: 13px;
}

.orders-v2-meta-block {
  grid-column: 1;
  grid-row: 2;
  min-width: 0;
}

.orders-v2-meta {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.orders-v2-time--left {
  margin-top: 8px;
  white-space: nowrap;
}

.orders-v2-right-copy {
  grid-column: 2;
  grid-row: 2;
  min-width: 0;
  text-align: right;
  white-space: nowrap;
}

.orders-v2-result {
  margin-top: 7px;
  max-width: 190px;
  font-size: clamp(17px, 4.8vw, 21px);
  line-height: 1.12;
  font-weight: 850;
  letter-spacing: -0.04em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.orders-v2-result.is-positive { color: #2faa67; }
.orders-v2-result.is-negative { color: #f05249; }

.orders-v2-chevron {
  position: absolute;
  top: 39px;
  right: 2px;
  color: #101a35;
  font-size: 24px;
}

.orders-v2-message {
  margin: 20px 8px 0;
  border-radius: 22px;
  padding: 26px 18px;
  background: rgba(255, 255, 255, 0.78);
  text-align: center;
  color: #6b7890;
  font-size: 14px;
}

.orders-v2-message--error { color: #e44942; background: rgba(255, 241, 240, 0.88); }

@media (max-width: 430px) {
  .orders-v2-main { padding-left: 12px; padding-right: 12px; }
  .orders-v2-type-filter, .orders-v2-status-row { margin-left: 8px; margin-right: 8px; }
  .orders-v2-chip { font-size: 13px; }
  .orders-v2-chip--type { min-width: 74px; padding: 0 17px; }
  .orders-v2-chip--status { min-width: 116px; padding: 0 14px; }
  .orders-v2-item { gap: 14px; padding: 8px 0 9px 9px; min-height: 88px; }
  .orders-v2-action-icon { width: 52px; height: 52px; flex-basis: 52px; }
  .orders-v2-item-main { column-gap: 8px; padding-right: 20px; }
  .orders-v2-item-title { font-size: 16px; }
  .orders-v2-badge { min-width: 78px; padding: 5px 8px; font-size: 13px; }
  .orders-v2-result { max-width: 150px; font-size: clamp(15px, 4.4vw, 19px); }
  .orders-v2-chevron { right: 0; top: 36px; }
}
</style>
