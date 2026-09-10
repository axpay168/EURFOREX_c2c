<template>
  <div class="fund-records-v2-page">
    <header class="fund-records-v2-header fixed top-0 left-0 w-full z-50">
      <a class="fund-records-v2-back" href="#/pages/setting/user" @click="backGo($event, '#/pages/setting/user')" :aria-label="localizedText('返回', 'Back')">
        <span class="material-symbols-outlined">arrow_back</span>
      </a>
      <div class="fund-records-v2-title font-headline">{{ localizedText('資金紀錄', 'Fund records') }}</div>
      <button type="button" class="fund-records-v2-filter" :aria-label="localizedText('查看全部資金紀錄', 'View all fund records')" @click="active = 'all'">
        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">filter_alt</span>
      </button>
    </header>

    <main class="fund-records-v2-main max-w-3xl mx-auto">
      <section class="fund-records-v2-tabs" :aria-label="localizedText('資金類型', 'Fund types')">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="fund-records-v2-tab"
          :class="active === tab.key ? 'is-active' : ''"
          :data-tab="tab.key"
          @click="active = tab.key"
        >{{ localizedText(tab.labelZh, tab.labelEn) }}</button>
      </section>

      <section class="fund-records-v2-card">
        <LoadingInlineSpinner v-if="loading" :aria-label="localizedText('資金紀錄載入', 'Loading fund records')" />
        <p v-else-if="errorMessage" class="fund-records-v2-message fund-records-v2-message--error">{{ errorMessage }}</p>
        <template v-else-if="visibleItems.length">
          <a
            v-for="(record, index) in visibleItems"
            :key="record.id"
            class="fund-records-v2-item"
            :class="index === visibleItems.length - 1 ? 'is-last' : ''"
            :href="record.href"
            :data-type="record.type"
          >
            <img class="fund-records-v2-icon" :src="record.iconSrc" :alt="record.title" loading="eager" decoding="async" />
            <div class="fund-records-v2-copy">
              <div class="fund-records-v2-row fund-records-v2-row--top">
                <h2 class="fund-records-v2-item-title font-headline">{{ record.title }}</h2>
                <span class="fund-records-v2-badge" :class="record.badgeClass">{{ record.statusLabel }}</span>
              </div>
              <div class="fund-records-v2-row fund-records-v2-row--bottom">
                <div class="fund-records-v2-meta-block">
                  <div class="fund-records-v2-meta">{{ record.meta }}</div>
                  <div class="fund-records-v2-time fund-records-v2-time--left">{{ record.time }}</div>
                </div>
                <div class="fund-records-v2-side">
                  <div class="fund-records-v2-value" :class="record.valueClass">
                    <span>{{ record.valueAmount }}</span>
                    <span v-if="record.valueAsset" class="fund-records-v2-value-asset">{{ record.valueAsset }}</span>
                  </div>
                </div>
                <span class="fund-records-v2-chevron material-symbols-outlined">chevron_right</span>
              </div>
            </div>
          </a>
        </template>
        <div v-else class="fund-records-v2-empty">
          <h2>{{ $t('phrases.此分類暫無紀錄') }}</h2>
          <p>{{ $t('phrases.目前沒有符合條件的流水資料，切換分類或返回資產頁後再試。') }}</p>
          <button type="button" @click="active = 'all'">{{ $t('phrases.查看全部') }}</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { userApi } from '@/utils/api'
import { fundBtcIcon, orderDepositIcon, orderWithdrawIcon } from '@/assets/images'

var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--fund-record",
  "font-body",
  "antialiased",
  "min-h-screen",
  "bg-background",
  "text-on-surface"
];

export default {
  name: "FundRecordH5",
  data: function () {
    return {
      active: "all",
      tabs: [
        { key: "all", labelZh: "全部", labelEn: "All" },
        { key: "deposit", labelZh: "充值", labelEn: "Recharge" },
        { key: "withdraw", labelZh: "提現", labelEn: "Withdrawal" },
        { key: "settlement", labelZh: "結算", labelEn: "Settlement" }
      ],
      items: [],
      loading: false,
      errorMessage: ""
    };
  },
  computed: {
    visibleItems: function () {
      var active = this.active;
      if (active === "all") return this.items;
      return this.items.filter(function (item) { return item.type === active; });
    }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) document.body.classList.add(BODY_CLASSES[i]);
      document.body.setAttribute("data-nc2c-page", "fund-record");
      document.body.setAttribute("data-nc2c-locked", "true");
    } catch (e) {}
    this.loadSharedScript("/static/previews/shared/back-nav.js", "eurnyseBackNav");
    this.fetchRecords();
  },
  beforeDestroy: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) document.body.classList.remove(BODY_CLASSES[i]);
      document.body.removeAttribute("data-nc2c-page");
      document.body.removeAttribute("data-nc2c-locked");
    } catch (e) {}
  },
  methods: {
    backGo: function (event, fallback) {
      if (window.EurnyseBack && typeof window.EurnyseBack.go === "function") {
        if (event && event.preventDefault) event.preventDefault();
        window.EurnyseBack.go(fallback);
      }
    },
    fetchRecords: function () {
      var self = this;
      this.loading = true;
      this.errorMessage = "";
      userApi
        .fundRecords("")
        .then(function (data) {
          var rows = (data && data.items) || [];
          self.items = rows.map(function (item) { return self.mapRecord(item); });
        })
        .catch(function (error) {
          self.items = [];
          self.errorMessage = (error && error.message) || self.localizedText("載入資金紀錄失敗", "Failed to load fund records");
        })
        .finally(function () { self.loading = false; });
    },
    mapRecord: function (item) {
      var rawType = String(item.type || "");
      var type = rawType === "recharge" ? "deposit" : rawType === "financial" ? "settlement" : rawType;
      var asset = item.asset_code || "";
      var amount = this.formatAmount(item.amount, 2);
      var sign = this.recordSign(item, type);
      return {
        id: item.id || String(type) + "-" + String(item.record_id || ""),
        type: type,
        title: this.recordTitle(rawType, item, asset),
        meta: this.recordMeta(rawType, item),
        time: this.formatDateTime(item.created_at || item.updated_at || "—"),
        value: sign + amount + (asset ? " " + asset : ""),
        valueAmount: sign + amount,
        valueAsset: asset,
        valueClass: sign === "-" ? "is-negative" : this.statusTone(item.status, true),
        statusLabel: this.statusLabel(item.status),
        badgeClass: this.statusBadgeClass(item.status),
        iconSrc: this.recordIcon(type, asset, item.status),
        href: "#/" + String(item.route || "/pages/setting/wallet").replace(/^\//, "")
      };
    },
    recordSign: function (item, type) {
      if (String(item.value || "").charAt(0) === "-") return "-";
      if (type === "withdraw") return "-";
      return "+";
    },
    recordTitle: function (type, item, asset) {
      if (type === "recharge") return this.localizedText("充值", "Top up");
      if (type === "withdraw") return this.localizedText("提現", "Withdraw");
      if (type === "financial") return this.localizedText("理財申購", "Earn subscription");
      return item.title || this.localizedText("資金紀錄", "Fund record");
    },
    recordMeta: function (type, item) {
      if (type === "withdraw" && String(item.channel_type || "") === "bank") return this.localizedText("銀行轉帳", "Bank transfer");
      if (item.network) return this.localizedText("網絡: ", "Network: ") + item.network;
      return item.description || (type === "deposit" ? this.localizedText("充值紀錄", "Top up record") : this.localizedText("資金紀錄", "Fund record"));
    },
    recordIcon: function (type, asset, status) {
      if (String(asset || "").toUpperCase() === "BTC") return fundBtcIcon;
      if (type === "withdraw") return orderWithdrawIcon;
      if (status === "rejected" || status === "failed") return orderDepositIcon;
      return orderDepositIcon;
    },
    statusLabel: function (status) {
      var map = {
        pending: this.localizedText("處理中", "Processing"),
        approved: this.localizedText("已完成", "Completed"),
        rejected: this.localizedText("失敗", "Failed"),
        failed: this.localizedText("失敗", "Failed"),
        completed: this.localizedText("已完成", "Completed"),
        active: this.localizedText("處理中", "Processing"),
        settled: this.localizedText("已完成", "Completed")
      };
      return map[status] || status || "—";
    },
    statusBadgeClass: function (status) {
      if (status === "approved" || status === "completed" || status === "settled") return "is-completed";
      if (status === "rejected" || status === "failed") return "is-failed";
      return "is-processing";
    },
    statusTone: function (status, positive) {
      if (status === "rejected" || status === "failed") return "is-failed-value";
      return positive ? "is-positive" : "";
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

.fund-records-v2-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbff 0%, #edf7ff 42%, #f8fbff 100%);
  color: #111a38;
  font-family: Manrope, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.fund-records-v2-header {
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px;
  background: rgba(255, 255, 255, 0.88);
  border-bottom: 1px solid rgba(219, 229, 242, 0.72);
  box-shadow: 0 10px 28px rgba(28, 72, 126, 0.06);
  backdrop-filter: blur(22px);
}

.fund-records-v2-back {
  position: absolute;
  left: 36px;
  display: inline-flex;
  color: #386bd8;
  text-decoration: none;
}

.fund-records-v2-title {
  font-size: 23px;
  line-height: 1.2;
  font-weight: 850;
  letter-spacing: -0.04em;
}

.fund-records-v2-filter {
  position: absolute;
  right: 18px;
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(180deg, #63a5ff, #315fd0);
  box-shadow: 0 10px 20px rgba(49, 95, 208, 0.22), inset 0 1px 0 rgba(255,255,255,0.4);
}

.fund-records-v2-main {
  padding: 106px 21px 34px;
}

.fund-records-v2-tabs {
  margin-bottom: 27px;
  padding: 13px 15px;
  border-radius: 27px;
  display: flex;
  gap: 11px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(226, 237, 248, 0.9);
  box-shadow: 0 17px 34px rgba(54, 108, 154, 0.08), inset 0 1px 0 rgba(255,255,255,0.92);
}

.fund-records-v2-tabs::-webkit-scrollbar {
  display: none;
}

.fund-records-v2-tab {
  height: 48px;
  min-width: 112px;
  flex: 0 0 auto;
  padding: 0 20px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.84);
  color: #6d7c91;
  font-size: 18px;
  font-weight: 500;
  transition: all 0.16s ease;
}

.fund-records-v2-tab.is-active {
  color: #fff;
  font-weight: 800;
  background: linear-gradient(180deg, #63a5ff, #2f5ccc);
  box-shadow: 0 10px 18px rgba(48, 92, 204, 0.22), inset 0 1px 0 rgba(255,255,255,0.42);
}

.fund-records-v2-card {
  border-radius: 28px;
  padding: 15px 14px 16px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(224, 234, 247, 0.95);
  box-shadow: 0 18px 42px rgba(43, 91, 141, 0.08), inset 0 1px 0 rgba(255,255,255,0.94);
  overflow: hidden;
}

.fund-records-v2-item {
  min-height: 92px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 9px 0 10px 14px;
  color: inherit;
  text-decoration: none;
}

.fund-records-v2-item:not(.is-last) .fund-records-v2-copy {
  border-bottom: 1px solid rgba(219, 228, 240, 0.86);
}

.fund-records-v2-icon {
  width: 58px;
  height: 58px;
  flex: 0 0 58px;
  object-fit: contain;
  filter: drop-shadow(0 10px 14px rgba(48, 86, 142, 0.12));
}

.fund-records-v2-copy {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 168px;
  grid-template-rows: auto auto;
  column-gap: 10px;
  row-gap: 7px;
  padding: 0 20px 10px 0;
}

.fund-records-v2-row {
  display: contents;
}

.fund-records-v2-row--top {
  margin-bottom: 0;
}

.fund-records-v2-item-title {
  grid-column: 1;
  grid-row: 1;
  min-width: 0;
  color: #121a38;
  font-size: 17px;
  line-height: 1.18;
  font-weight: 850;
  letter-spacing: -0.035em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fund-records-v2-badge {
  grid-column: 2;
  grid-row: 1;
  align-self: start;
  width: 100%;
  height: 28px;
  border-radius: 8px;
  padding: 0 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1.1;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fund-records-v2-badge.is-completed { color: #2ca767; background: #effcf5; border: 1px solid #d7f2e4; }
.fund-records-v2-badge.is-processing { color: #d99410; background: #fff9ed; border: 1px solid #ffe9bd; }
.fund-records-v2-badge.is-failed { color: #f05249; background: #fff1f0; border: 1px solid #ffd9d5; }

.fund-records-v2-row--bottom {
  position: relative;
  padding-right: 0;
}

.fund-records-v2-meta,
.fund-records-v2-time {
  color: #78869d;
  font-size: 13px;
  line-height: 1.25;
}

.fund-records-v2-meta-block {
  grid-column: 1;
  grid-row: 2;
  min-width: 0;
}

.fund-records-v2-meta {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fund-records-v2-time--left {
  margin-top: 8px;
  white-space: nowrap;
}

.fund-records-v2-side {
  grid-column: 2;
  grid-row: 2;
  width: 100%;
  min-width: 0;
  text-align: right;
  white-space: nowrap;
}

.fund-records-v2-value {
  margin-top: 7px;
  color: #111a38;
  font-size: clamp(15px, 4.1vw, 18px);
  line-height: 1.12;
  font-weight: 850;
  letter-spacing: -0.04em;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  gap: 3px;
  white-space: nowrap;
}

.fund-records-v2-value span:first-child {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fund-records-v2-value-asset {
  flex: 0 0 auto;
  font-size: 0.78em;
  letter-spacing: -0.03em;
}

.fund-records-v2-value.is-positive { color: #2faa67; }
.fund-records-v2-value.is-negative { color: #111a38; }
.fund-records-v2-value.is-failed-value { color: #f05249; }

.fund-records-v2-chevron {
  position: absolute;
  top: 39px;
  right: 2px;
  color: #101a35;
  font-size: 24px;
}

.fund-records-v2-empty,
.fund-records-v2-message {
  padding: 34px 18px;
  text-align: center;
  color: #6b7890;
}

.fund-records-v2-empty h2 {
  margin: 0 0 8px;
  color: #111a38;
  font-size: 18px;
  font-weight: 800;
}

.fund-records-v2-empty p {
  margin: 0 auto 18px;
  max-width: 330px;
  font-size: 14px;
  line-height: 1.5;
}

.fund-records-v2-empty button {
  height: 40px;
  padding: 0 22px;
  border: 0;
  border-radius: 999px;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(180deg, #63a5ff, #2f5ccc);
}

.fund-records-v2-message--error {
  color: #e44942;
}

@media (max-width: 430px) {
  .fund-records-v2-main { padding: 106px 20px 32px; }
  .fund-records-v2-tabs { padding: 13px 15px; gap: 10px; }
  .fund-records-v2-tab { min-width: 116px; font-size: 18px; }
  .fund-records-v2-card { padding-left: 12px; padding-right: 12px; }
  .fund-records-v2-item { gap: 14px; padding: 8px 0 9px 9px; min-height: 88px; }
  .fund-records-v2-icon { width: 52px; height: 52px; flex-basis: 52px; }
  .fund-records-v2-copy { grid-template-columns: minmax(0, 1fr) 154px; column-gap: 8px; padding-right: 20px; }
  .fund-records-v2-item-title { font-size: 16px; }
  .fund-records-v2-badge { height: 28px; padding: 0 8px; font-size: 13px; }
  .fund-records-v2-value { font-size: clamp(13px, 3.75vw, 16px); gap: 2px; }
  .fund-records-v2-value-asset { font-size: 0.72em; }
  .fund-records-v2-chevron { right: 0; top: 36px; }
}
</style>
