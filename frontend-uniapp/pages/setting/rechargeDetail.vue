<template>
  <div class="recharge-submitted-page">
    <header class="recharge-submitted-header fixed top-0 left-0 w-full z-50">
      <img class="recharge-submitted-logo" :src="logoSrc" :alt="localizedText('EURFOREX 標誌', 'EURFOREX logo')" />
      <div class="recharge-submitted-title font-headline">{{ localizedText('充值已提交', 'Top up submitted') }}</div>
      <a class="recharge-submitted-bell" href="#/pages/index/serviceCenter" :aria-label="localizedText('通知', 'Notifications')">
        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">notifications</span>
      </a>
    </header>

    <main class="recharge-submitted-main max-w-3xl mx-auto">
      <LoadingInlineSpinner v-if="loading" :aria-label="localizedText('充值詳情載入', 'Loading recharge details')" />
      <p v-else-if="errorMessage" class="recharge-submitted-message recharge-submitted-message--error">{{ errorMessage }}</p>
      <template v-else>
        <section class="recharge-submitted-card">
          <div class="recharge-submitted-hero">
            <img class="recharge-submitted-success-icon" :src="successIconSrc" :alt="localizedText('提交成功', 'Submission successful')" loading="eager" decoding="async" />
            <h1 class="recharge-submitted-heading font-headline">{{ localizedText('提交成功', 'Submission successful') }}</h1>
            <div class="recharge-submitted-status" :class="statusHeadlineClass">{{ statusHeadline }}</div>
            <p class="recharge-submitted-copy">
              {{ localizedText('您的轉帳憑證已提交。審核通過後充值將入帳。', 'Your transfer proof has been submitted. The deposit will be credited after verification.') }}
            </p>
          </div>

          <div class="recharge-submitted-divider"></div>

          <dl class="recharge-submitted-details">
            <div class="recharge-submitted-detail-row">
              <dt>{{ localizedText('資產', 'Asset') }}</dt>
              <dd>{{ assetCode }}</dd>
            </div>
            <div class="recharge-submitted-detail-row">
              <dt>{{ localizedText('網絡', 'Network') }}</dt>
              <dd>{{ item.network || '-' }}</dd>
            </div>
            <div class="recharge-submitted-detail-row">
              <dt>{{ localizedText('充值金額', 'Deposit amount') }}</dt>
              <dd>{{ amountDisplay }}</dd>
            </div>
            <div class="recharge-submitted-detail-row">
              <dt>{{ localizedText('提交時間', 'Submitted at') }}</dt>
              <dd>{{ submittedAt }}</dd>
            </div>
            <div class="recharge-submitted-detail-row">
              <dt>{{ localizedText('憑證', 'Voucher') }}</dt>
              <dd class="is-uploaded">{{ localizedText('已上傳', 'Uploaded') }}</dd>
            </div>
            <div class="recharge-submitted-detail-row">
              <dt>{{ localizedText('狀態', 'Status') }}</dt>
              <dd :class="statusValueClass">{{ statusLabel }}</dd>
            </div>
          </dl>

          <div class="recharge-submitted-credit">
            <span>{{ localizedText('預計到帳', 'Expected credit') }}</span>
            <strong>{{ amountDisplay }}</strong>
          </div>
        </section>

        <div class="recharge-submitted-actions">
          <a class="recharge-submitted-primary" href="#/pages/setting/fundRecord">{{ localizedText('關閉', 'Close') }}</a>
        </div>
      </template>
    </main>
  </div>
</template>

<script>
import { userApi } from '@/utils/api'
import { brandMarkLogo, topupSubmittedIcon } from '@/assets/images'

var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--recharge-detail",
  "font-body",
  "antialiased",
  "min-h-screen",
  "bg-background",
  "text-on-surface"
];

export default {
  name: "RechargeDetailH5",
  data: function () {
    return {
      logoSrc: brandMarkLogo,
      successIconSrc: topupSubmittedIcon,
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
      var amount = n ? n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (raw || "-");
      return amount + " " + this.assetCode;
    },
    submittedAt: function () {
      return this.formatDateTime(this.item.created_at || this.item.submitted_at || this.item.updated_at || "-");
    },
    statusHeadline: function () {
      if (this.item.status === "approved") return this.localizedText("已確認", "Confirmed");
      if (this.item.status === "rejected" || this.item.status === "cancelled") return this.localizedText("審核未通過", "Review failed");
      return this.localizedText("等待確認", "Waiting for confirmation");
    },
    statusLabel: function () {
      var map = {
        pending: this.localizedText("待審核", "Pending review"),
        approved: this.localizedText("已完成", "Completed"),
        rejected: this.localizedText("已駁回", "Rejected"),
        cancelled: this.localizedText("已取消", "Cancelled")
      };
      return map[this.item.status] || this.item.status || this.localizedText("待審核", "Pending review");
    },
    statusValueClass: function () {
      if (this.item.status === "approved") return "is-approved";
      if (this.item.status === "rejected" || this.item.status === "cancelled") return "is-rejected";
      return "is-pending";
    },
    statusHeadlineClass: function () {
      return this.statusValueClass;
    }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) document.body.classList.add(BODY_CLASSES[i]);
      document.body.setAttribute("data-nc2c-page", "recharge-detail");
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
        this.errorMessage = this.localizedText("缺少充值申請編號", "Missing recharge request ID");
        this.loading = false;
        return;
      }
      var self = this;
      userApi.depositRequestDetail(id).then(function (data) {
        self.item = data.request || {};
      }).catch(function (error) {
        self.errorMessage = (error && error.message) || self.localizedText("載入充值詳情失敗", "Failed to load recharge details");
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

.recharge-submitted-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fbff 0%, #eef7ff 42%, #f8fbff 100%);
  color: #121a38;
  font-family: Manrope, Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.recharge-submitted-header {
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

.recharge-submitted-logo {
  position: absolute;
  left: 42px;
  width: 52px;
  height: 36px;
  object-fit: contain;
}

.recharge-submitted-title {
  font-size: 21px;
  line-height: 1.2;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.recharge-submitted-bell {
  position: absolute;
  right: 38px;
  display: inline-flex;
  color: #4d73e6;
  text-decoration: none;
}

.recharge-submitted-main {
  padding: 107px 35px 30px;
}

.recharge-submitted-card {
  padding: 35px 27px 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(224, 234, 247, 0.95);
  box-shadow: 0 18px 42px rgba(43, 91, 141, 0.08), inset 0 1px 0 rgba(255,255,255,0.94);
}

.recharge-submitted-hero {
  text-align: center;
}

.recharge-submitted-success-icon {
  width: 146px;
  height: 146px;
  object-fit: contain;
  margin: -20px auto 10px;
}

.recharge-submitted-heading {
  font-size: 28px;
  line-height: 1.14;
  font-weight: 900;
  letter-spacing: -0.05em;
}

.recharge-submitted-status {
  margin-top: 7px;
  font-size: 17px;
  line-height: 1.2;
  font-weight: 800;
}

.recharge-submitted-status.is-approved {
  color: #35b88a;
}

.recharge-submitted-status.is-pending {
  color: #f59b13;
}

.recharge-submitted-status.is-rejected {
  color: #ef5148;
}

.recharge-submitted-copy {
  max-width: 360px;
  margin: 10px auto 25px;
  color: #75849b;
  font-size: 16px;
  line-height: 1.45;
}

.recharge-submitted-divider {
  height: 1px;
  margin: 0 0 20px;
  background: rgba(214, 224, 238, 0.95);
}

.recharge-submitted-details {
  margin: 0;
}

.recharge-submitted-detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 42px;
  font-size: 17px;
}

.recharge-submitted-detail-row dt {
  color: #73839b;
  font-weight: 500;
}

.recharge-submitted-detail-row dd {
  margin: 0;
  color: #111a38;
  font-weight: 600;
  text-align: right;
}

.recharge-submitted-detail-row .is-uploaded,
.recharge-submitted-detail-row .is-approved {
  color: #35b88a;
}

.recharge-submitted-detail-row .is-pending {
  color: #f59b13;
}

.recharge-submitted-detail-row .is-rejected {
  color: #ef5148;
}

.recharge-submitted-credit {
  height: 58px;
  margin-top: 18px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid #cddcff;
  border-radius: 10px;
  background: linear-gradient(180deg, #f1f6ff, #eaf2ff);
  color: #416bd8;
  font-size: 16px;
  font-weight: 800;
}

.recharge-submitted-credit strong {
  font-size: 19px;
  letter-spacing: -0.03em;
}

.recharge-submitted-actions {
  margin-top: 19px;
  display: grid;
  gap: 13px;
}

.recharge-submitted-primary {
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  text-decoration: none;
  font-size: 17px;
  font-weight: 800;
}

.recharge-submitted-primary {
  color: #fff;
  background: linear-gradient(180deg, #5f86f1, #2f57c8);
  box-shadow: 0 12px 24px rgba(51, 86, 197, 0.22);
}

.recharge-submitted-message {
  margin-top: 24px;
  border-radius: 22px;
  padding: 26px 18px;
  background: rgba(255, 255, 255, 0.82);
  text-align: center;
  color: #6b7890;
  font-size: 14px;
}

.recharge-submitted-message--error {
  color: #e44942;
  background: rgba(255, 241, 240, 0.88);
}

@media (max-width: 430px) {
  .recharge-submitted-header { height: 76px; padding: 0 28px; }
  .recharge-submitted-logo { left: 30px; width: 48px; }
  .recharge-submitted-bell { right: 30px; }
  .recharge-submitted-main { padding: 98px 22px 28px; }
  .recharge-submitted-card { padding: 31px 25px 24px; }
  .recharge-submitted-success-icon { width: 132px; height: 132px; }
  .recharge-submitted-heading { font-size: 25px; }
  .recharge-submitted-copy { font-size: 15px; }
  .recharge-submitted-detail-row { font-size: 16px; }
}
</style>
