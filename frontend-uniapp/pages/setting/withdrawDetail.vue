<template>
  <div class="withdraw-submitted-page">
    <header class="withdraw-submitted-header fixed top-0 left-0 w-full z-50">
      <img class="withdraw-submitted-logo" :src="logoSrc" :alt="localizedText('EURFOREX 標誌', 'EURFOREX logo')" />
      <div class="withdraw-submitted-title font-headline">{{ localizedText('提現已提交', 'Withdrawal submitted') }}</div>
      <a class="withdraw-submitted-bell" href="#/pages/index/serviceCenter" :aria-label="localizedText('通知', 'Notifications')">
        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">notifications</span>
      </a>
    </header>

    <main class="withdraw-submitted-main max-w-3xl mx-auto">
      <LoadingInlineSpinner v-if="loading" :aria-label="localizedText('提現詳情載入', 'Loading withdrawal details')" />
      <p v-else-if="errorMessage" class="withdraw-submitted-message withdraw-submitted-message--error">{{ errorMessage }}</p>
      <template v-else>
        <section class="withdraw-submitted-card">
          <div class="withdraw-submitted-hero">
            <img class="withdraw-submitted-success-icon" :src="successIconSrc" :alt="localizedText('提交成功', 'Submission successful')" loading="eager" decoding="async" />
            <h1 class="withdraw-submitted-heading font-headline">{{ localizedText('提交成功', 'Submission successful') }}</h1>
            <div class="withdraw-submitted-status" :class="statusHeadlineClass">{{ statusHeadline }}</div>
            <p class="withdraw-submitted-copy">
              {{ localizedText('您的提現申請已提交。審核通過後將安排出金。', 'Your withdrawal request has been submitted. Payout will be arranged after verification.') }}
            </p>
          </div>

          <div class="withdraw-submitted-divider"></div>

          <dl class="withdraw-submitted-details">
            <div class="withdraw-submitted-detail-row">
              <dt>{{ localizedText('訂單編號', 'Order ID') }}</dt>
              <dd>{{ displayOrderNo }}</dd>
            </div>
            <div class="withdraw-submitted-detail-row">
              <dt>{{ localizedText('資產', 'Asset') }}</dt>
              <dd>{{ assetCode }}</dd>
            </div>
            <div class="withdraw-submitted-detail-row">
              <dt>{{ localizedText('提現金額', 'Withdrawal amount') }}</dt>
              <dd>{{ amountDisplay }}</dd>
            </div>
            <div class="withdraw-submitted-detail-row">
              <dt>{{ localizedText('來源錢包', 'Source wallet') }}</dt>
              <dd>{{ sourceWallet }}</dd>
            </div>
            <div class="withdraw-submitted-detail-row">
              <dt>{{ localizedText('提交時間', 'Submitted at') }}</dt>
              <dd>{{ submittedAt }}</dd>
            </div>
            <div class="withdraw-submitted-detail-row withdraw-submitted-detail-row--address">
              <dt>{{ localizedText('出金地址', 'Payout address') }}</dt>
              <dd>{{ payoutAddress }}</dd>
            </div>
            <div class="withdraw-submitted-detail-row">
              <dt>{{ localizedText('狀態', 'Status') }}</dt>
              <dd :class="statusValueClass">{{ statusLabel }}</dd>
            </div>
          </dl>

          <div class="withdraw-submitted-credit">
            <span>{{ localizedText('預計出金', 'Expected payout') }}</span>
            <strong>{{ amountDisplay }}</strong>
          </div>
        </section>

        <div class="withdraw-submitted-actions">
          <a class="withdraw-submitted-primary" href="#/pages/setting/fundRecord">{{ localizedText('關閉', 'Close') }}</a>
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
  "nc2c-page--withdraw-detail",
  "font-body",
  "antialiased",
  "min-h-screen",
  "bg-background",
  "text-on-surface"
];

export default {
  name: "WithdrawDetailH5",
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
      return this.item.asset_code || "USDT";
    },
    amountDisplay: function () {
      var raw = this.item.amount;
      var n = Number(raw || 0);
      var amount = n ? n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 8 }) : (raw || "-");
      return amount + " " + this.assetCode;
    },
    sourceWallet: function () {
      return this.item.source_wallet_code || "-";
    },
    payoutAddress: function () {
      return this.item.payout_address || "-";
    },
    submittedAt: function () {
      return this.formatDateTime(this.item.created_at || this.item.submitted_at || this.item.updated_at || "-");
    },
    statusHeadline: function () {
      if (this.item.status === "approved") return this.localizedText("已確認", "Confirmed");
      if (this.item.status === "rejected" || this.item.status === "cancelled") return this.localizedText("審核未通過", "Review failed");
      return this.localizedText("等待審核", "Waiting for review");
    },
    statusLabel: function () {
      var map = {
        pending: this.localizedText("審核中", "Under review"),
        approved: this.localizedText("已完成", "Completed"),
        rejected: this.localizedText("已駁回", "Rejected"),
        cancelled: this.localizedText("已取消", "Cancelled")
      };
      return map[this.item.status] || this.item.status || this.localizedText("審核中", "Under review");
    },
    statusValueClass: function () {
      if (this.item.status === "approved") return "is-approved";
      if (this.item.status === "rejected" || this.item.status === "cancelled") return "is-rejected";
      return "is-pending";
    },
    statusHeadlineClass: function () {
      return this.statusValueClass;
    },
    displayOrderNo: function () {
      return this.item.order_no || this.item.id || "-";
    }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) document.body.classList.add(BODY_CLASSES[i]);
      document.body.setAttribute("data-nc2c-page", "withdraw-detail");
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
    currentId: function () {
      var query = (window.location.hash || "").split("?")[1] || "";
      var params = new URLSearchParams(query);
      return params.get("request_id") || params.get("id") || "";
    },
    fetchDetail: function () {
      var id = this.currentId();
      if (!id) {
        this.errorMessage = this.localizedText("缺少提現申請編號", "Missing withdrawal request ID");
        this.loading = false;
        return;
      }
      var self = this;
      userApi.withdrawalRequestDetail(id).then(function (data) {
        self.item = data.request || {};
      }).catch(function (error) {
        self.errorMessage = (error && error.message) || self.localizedText("載入提現詳情失敗", "Failed to load withdrawal details");
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

.withdraw-submitted-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbff 0%, #eef7ff 42%, #f8fbff 100%);
  color: #121a38;
  font-family: Manrope, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.withdraw-submitted-header {
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

.withdraw-submitted-logo {
  position: absolute;
  left: 42px;
  width: 52px;
  height: 36px;
  object-fit: contain;
}

.withdraw-submitted-title {
  font-size: 21px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.withdraw-submitted-bell {
  position: absolute;
  right: 38px;
  display: inline-flex;
  color: #4d73e6;
  text-decoration: none;
}

.withdraw-submitted-main {
  padding: 107px 35px 30px;
}

.withdraw-submitted-card {
  padding: 35px 27px 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(224, 234, 247, 0.95);
  box-shadow: 0 18px 42px rgba(43, 91, 141, 0.08), inset 0 1px 0 rgba(255,255,255,0.94);
}

.withdraw-submitted-hero {
  text-align: center;
}

.withdraw-submitted-success-icon {
  width: 146px;
  height: 146px;
  object-fit: contain;
  margin: -20px auto 10px;
}

.withdraw-submitted-heading {
  font-size: 28px;
  line-height: 1.14;
  font-weight: 900;
  letter-spacing: -0.05em;
}

.withdraw-submitted-status {
  margin-top: 7px;
  font-size: 17px;
  line-height: 1.2;
  font-weight: 800;
}

.withdraw-submitted-status.is-approved { color: #35b88a; }
.withdraw-submitted-status.is-pending { color: #f59b13; }
.withdraw-submitted-status.is-rejected { color: #ef5148; }

.withdraw-submitted-copy {
  max-width: 360px;
  margin: 10px auto 25px;
  color: #75849b;
  font-size: 16px;
  line-height: 1.45;
}

.withdraw-submitted-divider {
  height: 1px;
  margin: 0 0 20px;
  background: rgba(214, 224, 238, 0.95);
}

.withdraw-submitted-details {
  margin: 0;
}

.withdraw-submitted-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 42px;
  font-size: 17px;
}

.withdraw-submitted-detail-row dt {
  color: #73839b;
  font-weight: 500;
}

.withdraw-submitted-detail-row dd {
  margin: 0;
  color: #111a38;
  font-weight: 600;
  text-align: right;
}

.withdraw-submitted-detail-row--address {
  align-items: flex-start;
}

.withdraw-submitted-detail-row--address dd {
  max-width: 58%;
  overflow-wrap: anywhere;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  line-height: 1.35;
}

.withdraw-submitted-detail-row .is-approved { color: #35b88a; }
.withdraw-submitted-detail-row .is-pending { color: #f59b13; }
.withdraw-submitted-detail-row .is-rejected { color: #ef5148; }

.withdraw-submitted-credit {
  min-height: 58px;
  margin-top: 18px;
  padding: 13px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  border: 1px solid #cddcff;
  border-radius: 10px;
  background: linear-gradient(180deg, #f1f6ff, #eaf2ff);
  color: #416bd8;
  font-size: 16px;
  font-weight: 800;
}

.withdraw-submitted-credit strong {
  font-size: 19px;
  letter-spacing: -0.03em;
  text-align: right;
}

.withdraw-submitted-actions {
  margin-top: 19px;
  display: grid;
  gap: 13px;
}

.withdraw-submitted-primary {
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  text-decoration: none;
  font-size: 17px;
  font-weight: 800;
}

.withdraw-submitted-primary {
  color: #fff;
  background: linear-gradient(180deg, #5f86f1, #2f57c8);
  box-shadow: 0 12px 24px rgba(51, 86, 197, 0.22);
}

.withdraw-submitted-message {
  margin-top: 24px;
  border-radius: 22px;
  padding: 26px 18px;
  background: rgba(255, 255, 255, 0.82);
  text-align: center;
  color: #6b7890;
  font-size: 14px;
}

.withdraw-submitted-message--error {
  color: #e44942;
  background: rgba(255, 241, 240, 0.88);
}

@media (max-width: 430px) {
  .withdraw-submitted-header { height: 76px; padding: 0 28px; }
  .withdraw-submitted-logo { left: 30px; width: 48px; }
  .withdraw-submitted-bell { right: 30px; }
  .withdraw-submitted-main { padding: 98px 22px 28px; }
  .withdraw-submitted-card { padding: 31px 25px 24px; }
  .withdraw-submitted-success-icon { width: 132px; height: 132px; }
  .withdraw-submitted-heading { font-size: 25px; }
  .withdraw-submitted-copy { font-size: 15px; }
  .withdraw-submitted-detail-row { font-size: 16px; }
}
</style>
