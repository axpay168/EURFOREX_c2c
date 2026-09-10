<template>
  <div>
    <header class="fixed top-0 w-full border-b border-primary/10 bg-white/75 backdrop-blur-3xl shadow-[0_12px_32px_rgba(33,79,131,0.08)] flex justify-between items-center px-6 h-14 w-full z-50">
      <a class="flex shrink-0 items-center justify-center rounded-full p-2 text-primary-dim transition-colors hover:bg-primary/10" href="javascript:;" @click="backGo($event, '#/pages/setting/user')"><span class="material-symbols-outlined">arrow_back</span></a>
      <div class="font-headline text-lg font-bold text-on-surface">{{ pageTitle }}</div>
      <div class="w-10 shrink-0" aria-hidden="true"></div>
    </header>
    <main class="kyc-layout pt-20 pb-16 px-4 md:px-8 max-w-4xl mx-auto">
        <section class="kyc-status-panel glass-panel-high rounded-[24px] px-5 pb-5 pt-2.5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 shrink-0 rounded-2xl bg-primary/10 border border-primary/15 text-primary flex items-center justify-center">
              <span class="material-symbols-outlined">badge</span>
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="font-headline text-lg text-on-surface">KYC</h2>
                <span class="material-symbols-outlined shrink-0 text-[20px] text-on-surface-variant" aria-hidden="true">shield_lock</span>
                <span class="shrink-0 rounded-full border border-outline-variant/12 bg-surface-container-high px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-on-surface-variant">{{ statusLabel }}</span>
              </div>
            </div>
          </div>
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between rounded-2xl bg-surface-bright/75 px-4 py-3 border border-outline-variant/10">
              <span class="text-on-surface">{{ documentTitle }}</span>
              <span class="text-on-surface-variant">{{ documentStatusLabel }}</span>
            </div>
            <div class="flex items-center justify-between rounded-2xl bg-surface-bright/75 px-4 py-3 border border-outline-variant/10">
              <span class="text-on-surface">{{ faceTitle }}</span>
              <span class="text-on-surface-variant">{{ faceStatusLabel }}</span>
            </div>
            <div class="flex items-center justify-between rounded-2xl bg-surface-bright/75 px-4 py-3 border border-outline-variant/10">
              <span class="text-on-surface">{{ mobileBindingTitle }}</span>
              <span class="font-semibold" :class="mobileBound ? 'text-primary-dim' : 'text-on-surface-variant'">{{ mobileBound ? statusCompletedText : statusNotBoundText }}</span>
            </div>
          </div>
          <p v-if="reviewNote" class="mt-4 rounded-2xl border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">{{ rejectReasonPrefix }}{{ reviewNote }}</p>
          <p v-if="statusMessage" class="mt-4 rounded-2xl border px-4 py-3 text-sm" :class="statusError ? 'border-error/20 bg-error/5 text-error' : 'border-primary/20 bg-primary/5 text-primary-dim'">{{ statusMessage }}</p>
        </section>

      <section class="kyc-form-panel glass-panel-high rounded-[24px] p-5">
        <LoadingInlineSpinner v-if="loading" />
        <h2 class="font-headline text-lg text-on-surface">{{ canSubmit ? submitFormTitle : submittedTitle }}</h2>
        <form id="kycForm" class="mt-4 space-y-3" @submit.prevent="submitKyc">
          <input id="kycLegalName" class="w-full rounded-2xl border border-outline-variant/20 bg-surface-bright/80 px-4 py-3 text-sm outline-none focus:border-primary/50" :placeholder="legalNamePlaceholder" v-model="form.legalName" :disabled="!canSubmit || submitting" />
          <input id="kycIdNumber" class="w-full rounded-2xl border border-outline-variant/20 bg-surface-bright/80 px-4 py-3 text-sm outline-none focus:border-primary/50" :placeholder="idNumberPlaceholder" v-model="form.idNumber" :disabled="!canSubmit || submitting" />
          <div class="grid gap-3 md:grid-cols-2">
            <label class="kyc-upload-card" :class="{ 'kyc-upload-card--disabled': !canSubmit || submitting, 'kyc-upload-card--filled': frontPreview }" for="kycFrontUrl">
              <input id="kycFrontUrl" class="sr-only" type="file" accept="image/*" :disabled="!canSubmit || submitting" @change="handleKycImageChange('front', $event)" />
              <span class="kyc-upload-card__label">{{ frontImageTitle }}</span>
              <span v-if="frontPreview" class="kyc-upload-card__preview">
                <img :src="frontPreview" :alt="frontImagePreviewAlt" />
              </span>
              <span v-else class="kyc-upload-card__empty">
                <span class="material-symbols-outlined">add_photo_alternate</span>
                <span>{{ clickUploadText }}</span>
              </span>
            </label>

            <label class="kyc-upload-card" :class="{ 'kyc-upload-card--disabled': !canSubmit || submitting, 'kyc-upload-card--filled': backPreview }" for="kycBackUrl">
              <input id="kycBackUrl" class="sr-only" type="file" accept="image/*" :disabled="!canSubmit || submitting" @change="handleKycImageChange('back', $event)" />
              <span class="kyc-upload-card__label">{{ backImageTitle }}</span>
              <span v-if="backPreview" class="kyc-upload-card__preview">
                <img :src="backPreview" :alt="backImagePreviewAlt" />
              </span>
              <span v-else class="kyc-upload-card__empty">
                <span class="material-symbols-outlined">add_photo_alternate</span>
                <span>{{ clickUploadText }}</span>
              </span>
            </label>
          </div>
          <button id="kycSubmitBtn" type="submit" class="w-full rounded-full bg-primary py-3 font-headline text-sm font-bold tracking-[0.16em] text-on-primary disabled:cursor-not-allowed disabled:opacity-60" :disabled="!canSubmit || submitting">{{ submitting ? submitInProgressLabel : submitLabel }}</button>
        </form>
      </section>

        <section class="kyc-safety-panel glass-panel-high rounded-[24px] p-5">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-2xl bg-secondary/10 border border-secondary/15 text-secondary flex items-center justify-center">
              <span class="material-symbols-outlined">policy</span>
            </div>
            <div>
              <h2 class="font-headline text-lg text-on-surface">{{ safetyTitle }}</h2>
              <p class="text-sm text-on-surface-variant">{{ safetyTipIntro }}</p>
            </div>
          </div>
          <div class="space-y-3 text-sm text-on-surface-variant">
            <div class="rounded-2xl bg-surface-bright/75 px-4 py-3 border border-outline-variant/10">{{ safetyTipOne }}</div>
            <div class="rounded-2xl bg-surface-bright/75 px-4 py-3 border border-outline-variant/10">{{ safetyTipTwo }}</div>
            <div class="rounded-2xl bg-surface-bright/75 px-4 py-3 border border-outline-variant/10">{{ safetyTipThree }}</div>
          </div>
        </section>
    </main>
  </div>
</template>

<script>
import { userApi } from '@/utils/api'

/**
 * EURFOREX - 實名認證 (純 H5 Vue2 Options API)
 * 以 docs/previews/nnn/kyc-verification.html 為唯一基準逐字遷移
 * 外部腳本：../shared/marble-bg.js、../shared/back-nav.js（動態注入）
 */
var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--kyc-verification",
  "font-body",
  "antialiased",
  "min-h-screen",
  "bg-background",
  "text-on-surface"
];

export default {
  name: "KycVerificationH5",
  data: function () {
    return {
      loading: false,
      submitting: false,
      application: null,
      mobileBound: false,
      statusMessage: "",
      statusError: false,
      form: {
        legalName: "",
        idNumber: "",
        frontUrl: "",
        backUrl: ""
      },
      frontFile: null,
      backFile: null,
      frontPreviewUrl: "",
      backPreviewUrl: "",
      submitStage: ""
    };
  },
  computed: {
    currentStatus: function () {
      return this.application && this.application.status ? String(this.application.status) : "";
    },
    normalizedStatus: function () {
      var status = this.currentStatus ? String(this.currentStatus).trim().toLowerCase() : "";
      if (!status) return "unsubmitted";
      if (status === "approved" || status === "success" || status === "verified" || status === "passed" || status === "complete" || status === "completed" || status === "approved.") return "approved";
      if (status === "pending" || status.indexOf("pending") !== -1 || status === "reviewing" || status === "in_review" || status === "under_review") return "pending";
      if (status === "rejected" || status.indexOf("reject") !== -1 || status === "failed" || status === "need_resubmit" || status.indexOf("need") !== -1 || status.indexOf("return") !== -1) return "rejected";
      if (status === "通過" || status === "已通過" || status.indexOf("完成") !== -1) return "approved";
      return "unsubmitted";
    },
    statusLabel: function () {
      if (this.loading) return "—";
      if (this.normalizedStatus === "approved") return this.$t("phrases.已認證");
      if (this.normalizedStatus === "pending") return this.$t("phrases.審核中");
      if (this.normalizedStatus === "rejected") return this.$t("phrases.需補件");
      return this.$t("phrases.未認證");
    },
    documentStatusLabel: function () {
      if (this.normalizedStatus === "approved") return this.$t("phrases.已通過");
      if (this.normalizedStatus === "pending") return this.$t("phrases.審核中");
      if (this.normalizedStatus === "rejected") return this.$t("phrases.需補傳");
      return this.$t("phrases.待提交");
    },
    faceStatusLabel: function () {
      if (this.normalizedStatus === "approved") return this.$t("phrases.已完成");
      if (this.normalizedStatus === "pending") return this.$t("phrases.審核中");
      if (this.normalizedStatus === "rejected") return this.$t("phrases.需重新確認");
      return this.$t("phrases.待提交");
    },
    reviewNote: function () {
      return this.normalizedStatus === "rejected" && this.application ? (this.application.review_note || "") : "";
    },
    canSubmit: function () {
      return this.normalizedStatus !== "pending" && this.normalizedStatus !== "approved";
    },
    submitLabel: function () {
      return this.normalizedStatus === "rejected" ? this.$t("phrases.補傳資料") : this.$t("phrases.提交審核");
    },
    pageTitle: function () {
      return this.$t("phrases.身份認證");
    },
    documentTitle: function () {
      return this.$t("phrases.身分證件");
    },
    faceTitle: function () {
      return this.$t("phrases.人臉驗證");
    },
    mobileBindingTitle: function () {
      return this.$t("phrases.手機綁定");
    },
    statusCompletedText: function () {
      return this.$t("phrases.已完成");
    },
    statusNotBoundText: function () {
      return this.$t("phrases.未綁定");
    },
    submitFormTitle: function () {
      return this.$t("phrases.提交實名資料");
    },
    submittedTitle: function () {
      return this.$t("phrases.資料已提交，請等待後台審核。");
    },
    legalNamePlaceholder: function () {
      return this.$t("phrases.法定姓名");
    },
    idNumberPlaceholder: function () {
      return this.$t("phrases.證件號碼");
    },
    frontImageTitle: function () {
      return this.$t("phrases.證件正面圖片 URL");
    },
    backImageTitle: function () {
      return this.$t("phrases.證件反面圖片 URL");
    },
    frontImagePreviewAlt: function () {
      return this.$t("phrases.證件正面圖片 URL");
    },
    backImagePreviewAlt: function () {
      return this.$t("phrases.證件反面圖片 URL");
    },
    clickUploadText: function () {
      return this.$t("phrases.上傳憑證");
    },
    rejectReasonPrefix: function () {
      return this.$t("phrases.駁回原因：");
    },
    safetyTitle: function () {
      return this.$t("phrases.安全提醒");
    },
    safetyTipIntro: function () {
      return this.$t("phrases.請妥善保護帳戶與驗證資料。");
    },
    safetyTipOne: function () {
      return this.$t("phrases.通過驗證後可提升單筆與每日結算額度。");
    },
    safetyTipTwo: function () {
      return this.$t("phrases.請與出金帳戶使用相同法定身分資訊。");
    },
    safetyTipThree: function () {
      return this.$t("phrases.審核通常於 1 個工作天內完成。");
    },
    frontPreview: function () {
      return this.frontPreviewUrl || this.form.frontUrl || "";
    },
    backPreview: function () {
      return this.backPreviewUrl || this.form.backUrl || "";
    },
    submitInProgressLabel: function () {
      if (this.submitStage === "uploading") return this.$t("phrases.上傳憑證中...");
      return this.$t("phrases.submitInProgress");
    }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) {
        document.body.classList.add(BODY_CLASSES[i]);
      }
      document.body.setAttribute("data-nc2c-page", "kyc-verification");
      document.body.setAttribute("data-nc2c-locked", "true");
    } catch (e) {}
    this.loadSharedScript("/static/previews/shared/marble-bg.js", "eurforexMarbleBgJs");
    this.loadSharedScript("/static/previews/shared/back-nav.js", "eurforexBackNav");
    this.fetchLatestKyc();
  },
  beforeDestroy: function () {
    this.revokePreviewUrl("front");
    this.revokePreviewUrl("back");
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) {
        document.body.classList.remove(BODY_CLASSES[i]);
      }
      document.body.removeAttribute("data-nc2c-page");
      document.body.removeAttribute("data-nc2c-locked");
    } catch (e) {}
  },
  methods: {
    backGo: function (event, fallback) {
      if (window.EurforexBack && typeof window.EurforexBack.go === "function") {
        if (event && event.preventDefault) event.preventDefault();
        window.EurforexBack.go(fallback);
      }
    },
    fetchLatestKyc: function () {
      var self = this;
      this.loading = true;
      Promise.all([userApi.kycLatest(), userApi.overview()])
        .then(function (results) {
          var data = results[0] || {};
          var overview = results[1] || {};
          self.application = data.application || null;
          var user = overview.user || {};
          self.mobileBound = Boolean(user.mobile || user.mobile_e164);
          if (self.application) {
            self.form.legalName = self.application.legal_name || "";
            self.form.idNumber = self.application.id_number || "";
            self.form.frontUrl = self.application.id_doc_front_url || "";
            self.form.backUrl = self.application.id_doc_back_url || "";
          }
        })
        .catch(function (error) {
          self.statusError = true;
          self.statusMessage = (error && error.message) || self.$t("phrases.載入 KYC 狀態失敗");
        })
        .finally(function () {
          self.loading = false;
        });
    },
    revokePreviewUrl: function (side) {
      var key = side === "front" ? "frontPreviewUrl" : "backPreviewUrl";
      if (this[key] && this[key].indexOf("blob:") === 0 && window.URL && window.URL.revokeObjectURL) {
        window.URL.revokeObjectURL(this[key]);
      }
      this[key] = "";
    },
    handleKycImageChange: function (side, event) {
      var input = event && event.target;
      var file = input && input.files && input.files[0];
      if (!file) return;
      this.revokePreviewUrl(side);
      var preview = window.URL && window.URL.createObjectURL ? window.URL.createObjectURL(file) : "";
      if (side === "front") {
        this.frontFile = file;
        this.frontPreviewUrl = preview;
      } else {
        this.backFile = file;
        this.backPreviewUrl = preview;
      }
    },
    uploadKycImageIfNeeded: function (side) {
      var file = side === "front" ? this.frontFile : this.backFile;
      var existingUrl = side === "front" ? this.form.frontUrl : this.form.backUrl;
      if (!file) return Promise.resolve((existingUrl || "").trim());
      return userApi.uploadFile(file, "kyc-doc").then(function (upload) {
        return upload.url || upload.public_url || "";
      });
    },
    submitKyc: function () {
      var legalName = (this.form.legalName || "").trim();
      var idNumber = (this.form.idNumber || "").trim();
      if (!legalName || !idNumber || (!this.frontFile && !this.form.frontUrl) || (!this.backFile && !this.form.backUrl)) {
        this.statusError = true;
        this.statusMessage = this.$t("phrases.請完整填寫姓名、證件號碼與證件圖片 URL");
        return;
      }

      var self = this;
      this.submitting = true;
      this.statusMessage = "";
      this.submitStage = "uploading";
      Promise.all([
        this.uploadKycImageIfNeeded("front"),
        this.uploadKycImageIfNeeded("back")
      ]).then(function (urls) {
        var frontUrl = (urls[0] || "").trim();
        var backUrl = (urls[1] || "").trim();
        if (!frontUrl || !backUrl) throw new Error(self.$t("phrases.頭像上傳失敗"));
        self.submitStage = "submitting";
        return userApi.submitKyc({
          legal_name: legalName,
          id_number: idNumber,
          id_doc_front_url: frontUrl,
          id_doc_back_url: backUrl
        });
      }).then(function () {
        self.statusError = false;
        self.statusMessage = self.$t("phrases.資料已提交，請等待後台審核。");
        self.frontFile = null;
        self.backFile = null;
        self.revokePreviewUrl("front");
        self.revokePreviewUrl("back");
        return self.fetchLatestKyc();
      }).catch(function (error) {
        self.statusError = true;
        self.statusMessage = (error && error.message) || self.$t("phrases.提交失敗，請稍後再試");
      }).finally(function () {
        self.submitting = false;
        self.submitStage = "";
      });
    }
  }
};
</script>

<style>
@import url("../../static/previews/shared/marble-bg.css");
@import url("../../static/previews/nc2c/css/preview-entry.css");

.kyc-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas:
    "status"
    "form"
    "safety";
}

.kyc-status-panel {
  grid-area: status;
}

.kyc-form-panel {
  grid-area: form;
}

.kyc-safety-panel {
  grid-area: safety;
}

@media (min-width: 768px) {
  .kyc-layout {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    grid-template-areas:
      "status safety"
      "form form";
  }
}

.kyc-upload-card {
  display: flex;
  min-height: 178px;
  cursor: pointer;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  border-radius: 22px;
  border: 1px dashed rgba(50, 112, 245, 0.35);
  background: linear-gradient(180deg, rgba(50, 112, 245, 0.08), rgba(255, 255, 255, 0.72));
  padding: 14px;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.kyc-upload-card:hover {
  border-color: rgba(50, 112, 245, 0.58);
  box-shadow: 0 14px 32px rgba(33, 79, 131, 0.12);
  transform: translateY(-1px);
}

.kyc-upload-card--disabled {
  cursor: not-allowed;
  opacity: 0.72;
  transform: none;
}

.kyc-upload-card__label {
  font-size: 13px;
  font-weight: 800;
  color: rgb(var(--color-on-surface, 21 29 43));
}

.kyc-upload-card__preview {
  display: block;
  height: 112px;
  overflow: hidden;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: inset 0 0 0 1px rgba(120, 145, 180, 0.18);
}

.kyc-upload-card__preview img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.kyc-upload-card__empty {
  display: flex;
  min-height: 112px;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.52);
  color: rgba(71, 85, 105, 0.9);
  font-size: 13px;
  font-weight: 700;
}

.kyc-upload-card__empty .material-symbols-outlined {
  font-size: 34px;
  color: rgba(50, 112, 245, 0.84);
}

</style>
