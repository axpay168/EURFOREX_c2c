<template>
  <div class="fiat-withdraw-submitted-page">
    <header class="fiat-withdraw-submitted-header fixed top-0 left-0 w-full z-50">
      <img class="fiat-withdraw-submitted-logo" :src="logoSrc" :alt="localizedText('EURFOREX 標誌', 'EURFOREX logo')" />
      <div class="fiat-withdraw-submitted-title font-headline">{{ localizedText('法幣提現已提交', 'Fiat withdrawal submitted') }}</div>
      <a class="fiat-withdraw-submitted-bell" href="#/pages/index/serviceCenter" :aria-label="localizedText('客服', 'Support')">
        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">notifications</span>
      </a>
    </header>

    <main class="fiat-withdraw-submitted-main max-w-3xl mx-auto">
      <LoadingInlineSpinner v-if="loading" :aria-label="localizedText('法幣提現詳情載入', 'Loading fiat withdrawal details')" />
      <p v-else-if="errorMessage" class="fiat-withdraw-submitted-message fiat-withdraw-submitted-message--error">{{ errorMessage }}</p>
      <template v-else>
        <section class="fiat-withdraw-submitted-card">
          <div class="fiat-withdraw-submitted-hero">
            <img class="fiat-withdraw-submitted-success-icon" :src="successIconSrc" :alt="localizedText('提交成功', 'Submission successful')" loading="eager" decoding="async" />
            <h1 class="fiat-withdraw-submitted-heading font-headline">{{ localizedText('提款申請已提交', 'Withdrawal request submitted') }}</h1>
            <div class="fiat-withdraw-submitted-status" :class="statusValueClass">{{ statusHeadline }}</div>
            <p class="fiat-withdraw-submitted-copy">
              {{ localizedText('您的法幣提款申請正在處理。審核通過後，資金將匯入已驗證的銀行帳戶。', 'Your fiat withdrawal request is being processed. Funds will be sent to your verified bank account after approval.') }}
            </p>
          </div>

          <div class="fiat-withdraw-submitted-divider"></div>

          <dl class="fiat-withdraw-submitted-details">
            <div class="fiat-withdraw-submitted-detail-row">
              <dt>{{ localizedText('訂單編號', 'Order ID') }}</dt>
              <dd>{{ displayOrderNo }}</dd>
            </div>
            <div class="fiat-withdraw-submitted-detail-row">
              <dt>{{ localizedText('提款金額', 'Withdrawal amount') }}</dt>
              <dd class="fiat-withdraw-submitted-amount">{{ amountDisplay }}</dd>
            </div>
            <div class="fiat-withdraw-submitted-detail-row">
              <dt>{{ localizedText('來源錢包', 'Source wallet') }}</dt>
              <dd>{{ sourceWallet }}</dd>
            </div>
            <div class="fiat-withdraw-submitted-detail-row">
              <dt>{{ localizedText('提交時間', 'Submitted at') }}</dt>
              <dd>{{ submittedAt }}</dd>
            </div>
            <div class="fiat-withdraw-submitted-detail-row">
              <dt>{{ localizedText('審核時間', 'Review time') }}</dt>
              <dd>{{ reviewedAt }}</dd>
            </div>
            <div class="fiat-withdraw-submitted-detail-row fiat-withdraw-submitted-detail-row--account">
              <dt>{{ localizedText('收款帳戶', 'Beneficiary account') }}</dt>
              <dd>{{ payoutSummary }}</dd>
            </div>
            <div class="fiat-withdraw-submitted-detail-row">
              <dt>{{ localizedText('狀態', 'Status') }}</dt>
              <dd :class="statusValueClass">{{ statusLabel }}</dd>
            </div>
          </dl>

          <div class="fiat-withdraw-submitted-credit">
            <span>{{ localizedText('預計入帳', 'Expected arrival') }}</span>
            <strong>{{ amountDisplay }}</strong>
          </div>
        </section>

        <div class="fiat-withdraw-submitted-actions">
          <a class="fiat-withdraw-submitted-primary" href="#/pages/setting/fundRecord">{{ localizedText('查看記錄', 'View records') }}</a>
          <a class="fiat-withdraw-submitted-secondary" href="#/pages/setting/fundRecord">{{ localizedText('關閉', 'Close') }}</a>
        </div>
      </template>
    </main>
  </div>
</template>

<script>
import { userApi } from '@/utils/api'
import { brandMarkLogo, orderWithdrawIcon } from '@/assets/images'

var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--withdraw-detail-fiat",
  "font-body",
  "antialiased",
  "min-h-screen",
  "bg-background",
  "text-on-surface"
];

export default {
  name: "WithdrawDetailFiatH5",
  data: function () {
    return {
      logoSrc: brandMarkLogo,
      successIconSrc: orderWithdrawIcon,
      item: {},
      errorMessage: "",
      loading: true
    };
  },
  computed: {
    assetCode: function () {
      return String(this.item.asset_code || "EUR").toUpperCase();
    },
    amountDisplay: function () {
      var raw = this.item.amount;
      var n = Number(raw || 0);
      var amount = n ? n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 8 }) : (raw || "-");
      return this.assetCode + " " + amount;
    },
    sourceWallet: function () {
      return this.item.source_wallet_code || "-";
    },
    submittedAt: function () {
      return this.formatDateTime(this.item.created_at || this.item.submitted_at || this.item.updated_at || "-");
    },
    reviewedAt: function () {
      return this.formatDateTime(this.item.reviewed_at || "-");
    },
    statusHeadline: function () {
      if (this.item.status === "approved") return this.localizedText("提款已完成", "Withdrawal completed");
      if (this.item.status === "rejected" || this.item.status === "cancelled") return this.localizedText("審核未通過", "Review failed");
      return this.localizedText("等待銀行處理", "Waiting for bank processing");
    },
    statusLabel: function () {
      var map = {
        pending: this.localizedText("處理中", "Processing"),
        approved: this.localizedText("已完成", "Completed"),
        rejected: this.localizedText("已駁回", "Rejected"),
        cancelled: this.localizedText("已取消", "Cancelled")
      };
      return map[this.item.status] || this.item.status || this.localizedText("處理中", "Processing");
    },
    statusValueClass: function () {
      if (this.item.status === "approved") return "is-approved";
      if (this.item.status === "rejected" || this.item.status === "cancelled") return "is-rejected";
      return "is-pending";
    },
    displayOrderNo: function () {
      return this.item.order_no || this.item.id || "-";
    },
    payoutSummary: function () {
      var parts = [this.item.bank_name, this.item.account_holder, this.item.account_no || this.item.account_no_masked].filter(Boolean);
      return parts.length ? parts.join(" · ") : (this.item.payout_address || "-");
    }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) document.body.classList.add(BODY_CLASSES[i]);
      document.body.setAttribute("data-nc2c-page", "withdraw-detail-fiat");
      document.body.setAttribute("data-nc2c-locked", "true");
    } catch (e) {}
    this.fetchDetail();
  },
  beforeDestroy: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) document.body.classList.remove(BODY_CLASSES[i]);
      document.body.removeAttribute("data-nc2c-page");
      document.body.removeAttribute("data-nc2c-locked");
    } catch (e) {}
  },
  methods: {
    localizedText: function (zh, en) {
      var lang = "zh-Hant";
      try {
        lang = (this.$i18n && this.$i18n.locale) || localStorage.getItem("eurforex.language") || localStorage.getItem("lang") || lang;
      } catch (e) {}
      return String(lang).toLowerCase().indexOf("zh") === 0 ? zh : en;
    },
    currentId: function () {
      var query = (window.location.hash || "").split("?")[1] || "";
      var params = new URLSearchParams(query);
      return params.get("request_id") || params.get("id") || "";
    },
    fetchDetail: function () {
      var id = this.currentId();
      if (!id) {
        this.errorMessage = this.localizedText("缺少提款申請編號", "Missing withdrawal request ID");
        this.loading = false;
        return;
      }
      var self = this;
      userApi.withdrawalRequestDetail(id).then(function (data) {
        self.item = data.request || {};
      }).catch(function (error) {
        self.errorMessage = (error && error.message) || self.localizedText("載入提款詳情失敗", "Failed to load withdrawal details");
      }).finally(function () {
        self.loading = false;
      });
    },
    formatDateTime: function (value) {
      if (!value || value === "-") return "-";
      return String(value).replace("T", " ").slice(0, 19);
    }
  }
};
</script>

<style>
@import url("../../static/previews/nc2c/css/preview-entry.css");

.fiat-withdraw-submitted-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbff 0%, #eef7ff 42%, #f8fbff 100%);
  color: #121a38;
  font-family: Manrope, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.fiat-withdraw-submitted-header {
  height: 86px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 36px;
  background: rgba(255, 255, 255, 0.88);
  border-bottom: 1px solid rgba(219, 229, 242, 0.72);
  box-shadow: 0 10px 28px rgba(28, 72, 126, 0.06);
  backdrop-filter: blur(22px);
}

.fiat-withdraw-submitted-logo {
  position: absolute;
  left: 42px;
  width: 52px;
  height: 36px;
  object-fit: contain;
}

.fiat-withdraw-submitted-title {
  font-size: 21px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.fiat-withdraw-submitted-bell {
  position: absolute;
  right: 38px;
  display: inline-flex;
  color: #4d73e6;
  text-decoration: none;
}

.fiat-withdraw-submitted-main {
  padding: 107px 35px 30px;
}

.fiat-withdraw-submitted-card {
  padding: 35px 27px 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(224, 234, 247, 0.95);
  box-shadow: 0 18px 42px rgba(43, 91, 141, 0.08), inset 0 1px 0 rgba(255,255,255,0.94);
}

.fiat-withdraw-submitted-hero {
  text-align: center;
}

.fiat-withdraw-submitted-success-icon {
  width: 146px;
  height: 146px;
  object-fit: contain;
  margin: -20px auto 10px;
}

.fiat-withdraw-submitted-heading {
  font-size: 28px;
  line-height: 1.14;
  font-weight: 900;
  letter-spacing: -0.05em;
}

.fiat-withdraw-submitted-status {
  margin-top: 7px;
  font-size: 17px;
  line-height: 1.2;
  font-weight: 800;
}

.fiat-withdraw-submitted-status.is-approved { color: #35b88a; }
.fiat-withdraw-submitted-status.is-pending { color: #f59b13; }
.fiat-withdraw-submitted-status.is-rejected { color: #ef5148; }

.fiat-withdraw-submitted-copy {
  max-width: 390px;
  margin: 10px auto 25px;
  color: #75849b;
  font-size: 16px;
  line-height: 1.45;
}

.fiat-withdraw-submitted-divider {
  height: 1px;
  margin: 0 0 20px;
  background: rgba(214, 224, 238, 0.95);
}

.fiat-withdraw-submitted-details {
  margin: 0;
}

.fiat-withdraw-submitted-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 42px;
  font-size: 17px;
}

.fiat-withdraw-submitted-detail-row dt {
  color: #73839b;
  font-weight: 500;
}

.fiat-withdraw-submitted-detail-row dd {
  margin: 0;
  color: #111a38;
  font-weight: 600;
  text-align: right;
}

.fiat-withdraw-submitted-amount {
  font-family: var(--font-headline, inherit);
  font-size: 19px;
  letter-spacing: -0.03em;
}

.fiat-withdraw-submitted-detail-row--account {
  align-items: flex-start;
}

.fiat-withdraw-submitted-detail-row--account dd {
  max-width: 62%;
  overflow-wrap: anywhere;
  font-size: 14px;
  line-height: 1.35;
}

.fiat-withdraw-submitted-detail-row .is-approved { color: #35b88a; }
.fiat-withdraw-submitted-detail-row .is-pending { color: #f59b13; }
.fiat-withdraw-submitted-detail-row .is-rejected { color: #ef5148; }

.fiat-withdraw-submitted-credit {
  min-height: 58px;
  margin-top: 18px;
  padding: 13px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid #cddcff;
  border-radius: 12px;
  background: linear-gradient(180deg, #f1f6ff, #eaf2ff);
  color: #416bd8;
  font-size: 16px;
  font-weight: 800;
}

.fiat-withdraw-submitted-credit strong {
  font-size: 19px;
  letter-spacing: -0.03em;
  text-align: right;
}

.fiat-withdraw-submitted-actions {
  margin-top: 19px;
  display: grid;
  gap: 13px;
}

.fiat-withdraw-submitted-primary,
.fiat-withdraw-submitted-secondary {
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  text-decoration: none;
  font-size: 17px;
  font-weight: 800;
}

.fiat-withdraw-submitted-primary {
  color: #fff;
  background: linear-gradient(180deg, #5f86f1, #2f57c8);
  box-shadow: 0 12px 24px rgba(51, 86, 197, 0.22);
}

.fiat-withdraw-submitted-secondary {
  color: #416bd8;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(205, 220, 255, 0.9);
}

.fiat-withdraw-submitted-message {
  margin-top: 24px;
  border-radius: 22px;
  padding: 26px 18px;
  background: rgba(255, 255, 255, 0.82);
  text-align: center;
  color: #6b7890;
  font-size: 14px;
}

.fiat-withdraw-submitted-message--error {
  color: #e44942;
  background: rgba(255, 241, 240, 0.88);
}

@media (max-width: 430px) {
  .fiat-withdraw-submitted-header { height: 76px; padding: 0 28px; }
  .fiat-withdraw-submitted-logo { left: 30px; width: 48px; }
  .fiat-withdraw-submitted-bell { right: 30px; }
  .fiat-withdraw-submitted-main { padding: 98px 22px 28px; }
  .fiat-withdraw-submitted-card { padding: 31px 25px 24px; }
  .fiat-withdraw-submitted-success-icon { width: 132px; height: 132px; }
  .fiat-withdraw-submitted-heading { font-size: 25px; }
  .fiat-withdraw-submitted-copy { font-size: 15px; }
  .fiat-withdraw-submitted-detail-row { font-size: 16px; }
}
</style>
