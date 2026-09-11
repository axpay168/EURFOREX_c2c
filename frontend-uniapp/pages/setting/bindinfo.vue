<template>
  <div>
    <header class="fixed top-0 w-full border-b border-primary/10 bg-white/75 backdrop-blur-3xl shadow-[0_12px_32px_rgba(33,79,131,0.08)] flex justify-between items-center px-6 h-14 w-full z-50">
      <a class="flex shrink-0 items-center justify-center rounded-full p-2 text-primary-dim transition-colors hover:bg-primary/10" href="javascript:;" @click="backGo($event, '#/pages/setting/user')"><span class="material-symbols-outlined">arrow_back</span></a>
      <div class="font-headline text-lg font-bold text-on-surface">{{ localizedText("銀行綁定", "Bank binding") }}</div>
      <div class="w-10 shrink-0" aria-hidden="true"></div>
    </header>
    <main class="pt-20 pb-16 px-4 max-w-3xl mx-auto">
      <section class="rounded-[24px] border border-outline-variant/10 bg-white/80 p-5 shadow-[0_18px_36px_rgba(40,88,142,0.08)]">
        <div id="bank-list" class="space-y-3">
          <p v-if="accountCompletedNotice" class="bound-bank-card__done" role="status">{{ accountCompletedNotice }}</p>
          <LoadingInlineSpinner v-if="loading" :aria-label="localizedText('銀行資料載入', 'Loading bank info')" />
          <p v-else-if="loadError" class="rounded-2xl bg-error/5 px-4 py-4 text-center text-sm text-error">{{ loadError }}</p>
          <p v-else-if="!bankList.length" class="rounded-2xl bg-surface-container-low px-4 py-4 text-center text-sm text-on-surface-variant">{{ $t('phrases.尚未綁定銀行帳戶。') }}</p>
          <article v-for="(card, idx) in bankList" :key="card.id || idx" class="bound-bank-card">
            <div class="bound-bank-card__head">
              <div>
                <p class="bound-bank-card__eyebrow">{{ localizedText("已綁定銀行", "Bound banks") }} {{ idx + 1 }}</p>
                <h3 class="bound-bank-card__title">{{ localizedText("銀行收款帳戶", "Bank beneficiary account") }}</h3>
              </div>
              <span class="bound-bank-card__badge">{{ card.currency }}</span>
            </div>
            <div class="bound-bank-card__fields">
              <div class="bound-bank-card__row">
                <span>{{ localizedText("戶名", "Account holder") }}</span>
                <strong>{{ card.accountName }}</strong>
              </div>
              <div class="bound-bank-card__row">
                <span>{{ localizedText("銀行名", "Bank name") }}</span>
                <strong>{{ card.bankName }}</strong>
              </div>
              <div class="bound-bank-card__row">
                <span>{{ localizedText("帳號 / IBAN", "Account number / IBAN") }}</span>
                <strong class="font-mono tracking-wide">{{ card.accountNo }}</strong>
              </div>
              <div v-if="card.swift" class="bound-bank-card__row">
                <span>BIC/SWIFT</span>
                <strong class="font-mono tracking-wide">{{ card.swift }}</strong>
              </div>
              <div v-if="card.address" class="bound-bank-card__row">
                <span>{{ localizedText("開戶地址", "Account holder address") }}</span>
                <strong>{{ card.address }}</strong>
              </div>
            </div>
            <div v-if="card.needsFullAccount" class="bound-bank-card__fix">
              <p class="bound-bank-card__fix-text">{{ localizedText("此銀行帳戶尚未有完整帳號，請補填後才能用於提領。", "This bank account has no full account number yet. Please complete it before withdrawing.") }}</p>
              <form class="bound-bank-card__fix-form" @submit.prevent="submitFullAccount(card)">
                <input type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" :data-fix-account="card.id" v-model="card.fullAccountInput" :placeholder="localizedText('請輸入完整帳號 / IBAN', 'Enter the full account number / IBAN')" :aria-label="localizedText('請輸入完整帳號 / IBAN', 'Enter the full account number / IBAN')" />
                <button type="submit" :disabled="card.fixing || !card.fullAccountInput">{{ card.fixing ? $t('phrases.submitInProgress') : localizedText("補填完整帳號", "Complete account number") }}</button>
              </form>
              <p class="bound-bank-card__fix-hint">{{ localizedText("末四碼須與原帳號相同", "The last 4 digits must match the existing account") }}（{{ card.accountNo }}）</p>
              <p v-if="card.fixMessage" class="bound-bank-card__fix-msg" :class="card.fixError ? 'text-error' : 'text-primary-dim'">{{ card.fixMessage }}</p>
            </div>
          </article>
        </div>
        <button type="button" id="open-add-bank-modal" class="font-headline mt-4 flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dim" @click="openModal">{{ localizedText("新增銀行", "Add bank") }}</button>
      </section>
      <section class="mt-4 grid grid-cols-3 gap-3 text-sm">
        <a class="rounded-[20px] bg-white/80 border border-outline-variant/10 p-4 text-center shadow-[0_18px_36px_rgba(40,88,142,0.08)]" href="#/pages/setting/withdraw">{{ localizedText("前往提現", "Go to withdrawal") }}</a>
        <a class="rounded-[20px] bg-white/80 border border-outline-variant/10 p-4 text-center shadow-[0_18px_36px_rgba(40,88,142,0.08)]" href="#/pages/setting/securityCenter">{{ localizedText("安全中心", "Security center") }}</a>
        <a class="rounded-[20px] bg-white/80 border border-outline-variant/10 p-4 text-center shadow-[0_18px_36px_rgba(40,88,142,0.08)]" href="#/pages/index/serviceCenter">{{ localizedText("客服協助", "Customer support") }}</a>
      </section>
    </main>

    <div id="add-bank-modal" class="add-bank-overlay fixed inset-0 z-[60] items-start justify-center overflow-y-auto bg-black/45 p-4" :class="modalOpen ? 'flex' : 'hidden'" role="dialog" aria-modal="true" aria-labelledby="add-bank-modal-title" @click.self="closeModal">
      <div class="add-bank-dialog my-auto w-full max-w-md rounded-2xl border border-outline-variant/15 bg-surface-bright p-5 shadow-[0_24px_48px_rgba(22,41,63,0.18)]">
        <div class="flex items-center justify-between gap-3">
          <div>
            <h2 id="add-bank-modal-title" class="font-headline text-lg font-bold text-on-surface">{{ localizedText("新增銀行", "Add bank") }}</h2>
            <p class="mt-1 text-xs font-medium text-on-surface-variant">{{ localizedText("請選擇貨幣並填寫銀行名稱、帳號 / IBAN、BIC/SWIFT 與開戶人資料，提交後會直接綁定。", "Select the currency and fill in the bank name, account number / IBAN, BIC/SWIFT and account holder details. It will be bound immediately after submission.") }}</p>
          </div>
          <button type="button" id="close-add-bank-modal" class="rounded-full p-1.5 text-on-surface-variant hover:bg-surface-container-low" :aria-label="localizedText('關閉', 'Close')" @click="closeModal"><span class="material-symbols-outlined text-[22px] leading-none">close</span></button>
        </div>
        <form id="add-bank-form" class="mt-5 space-y-3.5" @submit.prevent="handleSubmit">
          <div class="add-bank-field">
            <label for="field-currency">{{ localizedText('貨幣', 'Currency') }}</label>
            <button type="button" id="field-currency" class="add-bank-select" aria-haspopup="dialog" :aria-expanded="currencyPickerOpen ? 'true' : 'false'" :aria-label="localizedText('選擇貨幣', 'Select currency')" @click="openCurrencyPicker">
              <span class="fiat-badge" :data-code="selectedCurrency.code">{{ selectedCurrency.symbol }}</span>
              <span class="add-bank-select__body">
                <strong>{{ selectedCurrency.code }}</strong>
                <span>{{ localizedText(selectedCurrency.nameZh, selectedCurrency.nameEn) }}</span>
              </span>
              <span class="material-symbols-outlined add-bank-select__chevron" aria-hidden="true">expand_more</span>
            </button>
          </div>
          <div class="add-bank-field">
            <label for="field-bank-name">{{ localizedText('銀行名稱', 'Bank name') }}</label>
            <input id="field-bank-name" ref="firstField" name="bankName" type="text" required v-model="form.bankName" :placeholder="localizedText('請輸入銀行名稱', 'Enter bank name')" />
          </div>
          <div class="add-bank-field">
            <label for="field-bank-account">{{ localizedText(selectedCurrency.accountZh, selectedCurrency.accountEn) }}<em>IBAN</em></label>
            <input id="field-bank-account" name="bankAccount" type="text" required autocomplete="off" autocapitalize="characters" spellcheck="false" v-model="form.bankAccount" :placeholder="localizedText('請輸入帳號或 IBAN', 'Enter account number or IBAN')" />
          </div>
          <div class="add-bank-field">
            <label for="field-bank-swift">BIC/SWIFT<em>{{ localizedText('選填', 'Optional') }}</em></label>
            <input id="field-bank-swift" name="bankSwift" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="11" v-model="form.bankSwift" placeholder="BIC" />
          </div>
          <div class="add-bank-field">
            <label for="field-account-name">{{ localizedText('開戶人姓名', 'Account holder name') }}</label>
            <input id="field-account-name" name="accountName" type="text" required autocomplete="name" v-model="form.accountName" :placeholder="localizedText('請輸入開戶人姓名', 'Enter account holder name')" />
          </div>
          <div class="add-bank-field">
            <label for="field-holder-address">{{ localizedText('開戶地址', 'Account holder address') }}<em>{{ localizedText('選填', 'Optional') }}</em></label>
            <input id="field-holder-address" name="holderAddress" type="text" autocomplete="street-address" v-model="form.holderAddress" :placeholder="localizedText('請輸入開戶地址', 'Enter account holder address')" />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" id="cancel-add-bank" class="flex-1 rounded-full border border-outline-variant/40 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low" @click="closeModal">{{ localizedText("取消", "Cancel") }}</button>
            <button type="submit" class="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-white transition-colors hover:bg-primary-dim disabled:opacity-60" :disabled="submitting">{{ submitting ? $t('phrases.submitInProgress') : $t('phrases.確認') }}</button>
          </div>
          <p v-if="submitMessage" class="text-center text-xs" :class="submitError ? 'text-error' : 'text-primary-dim'">{{ submitMessage }}</p>
        </form>
      </div>
      <Nc2cCenterSheet :visible.sync="currencyPickerOpen" :title="localizedText('選擇貨幣', 'Select currency')" title-id="bank-currency-picker-title">
        <div class="fiat-picker-list" role="listbox" :aria-label="localizedText('選擇貨幣', 'Select currency')">
          <button
            v-for="item in currencies"
            :key="item.code"
            type="button"
            role="option"
            class="fiat-option"
            :class="{ 'fiat-option--active': item.code === form.currency }"
            :aria-selected="item.code === form.currency ? 'true' : 'false'"
            :data-currency="item.code"
            @click="selectCurrency(item.code)"
          >
            <span class="fiat-badge fiat-badge--lg" :data-code="item.code">{{ item.symbol }}</span>
            <span class="fiat-option__body">
              <strong>{{ item.code }}</strong>
              <span>{{ localizedText(item.nameZh, item.nameEn) }}</span>
            </span>
            <span class="material-symbols-outlined fiat-option__mark" aria-hidden="true">{{ item.code === form.currency ? 'check_circle' : 'chevron_right' }}</span>
          </button>
        </div>
      </Nc2cCenterSheet>
    </div>
  </div>
</template>

<script>
import { userApi } from '@/utils/api'
import { FIAT_CURRENCIES, DEFAULT_FIAT_CODE, fiatCurrencyByCode, normalizeFiatCode } from '@/common/fiatCurrencies'

/**
 * EURFOREX - 銀行綁定 (純 H5 Vue2 Options API)
 * 以 docs/previews/nnn/bank-binding.html 為唯一基準逐字遷移
 * 外部腳本：../shared/marble-bg.js、../shared/back-nav.js（動態注入）
 * 原稿 IIFE（開關彈窗 + ESC 關閉 + 提交表單追加 bank-card）→ 全部遷移為 methods + v-for
 * maskAccount、escHtml 的行為透過 v-for + {{ }} 自動轉義 + computed 實現，邏輯等效
 */
var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--bank-binding",
  "font-body",
  "antialiased",
  "min-h-screen",
  "bg-background",
  "text-on-surface"
];

export default {
  name: "BankBindingH5",
  data: function () {
    return {
      modalOpen: false,
      loading: false,
      loadError: "",
      submitting: false,
      submitMessage: "",
      submitError: false,
      bankList: [],
      accountCompletedNotice: "",
      currencyPickerOpen: false,
      currencies: FIAT_CURRENCIES,
      form: { currency: DEFAULT_FIAT_CODE, bankName: "", bankAccount: "", bankSwift: "", accountName: "", holderAddress: "" }
    };
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) {
        document.body.classList.add(BODY_CLASSES[i]);
      }
      document.body.setAttribute("data-nc2c-page", "bank-binding");
      document.body.setAttribute("data-nc2c-locked", "true");
    } catch (e) {}
    this.loadSharedScript("/static/previews/shared/marble-bg.js", "eurforexMarbleBgJs");
    this.loadSharedScript("/static/previews/shared/back-nav.js", "eurforexBackNav");

    this.__escHandler = this.handleEscKey.bind(this);
    document.addEventListener("keydown", this.__escHandler);
    this.fetchBankList();
  },
  beforeDestroy: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) {
        document.body.classList.remove(BODY_CLASSES[i]);
      }
      document.body.removeAttribute("data-nc2c-page");
      document.body.removeAttribute("data-nc2c-locked");
      document.body.style.overflow = "";
    } catch (e) {}
    if (this.__escHandler) document.removeEventListener("keydown", this.__escHandler);
  },
  computed: {
    selectedCurrency: function () {
      return fiatCurrencyByCode(this.form.currency);
    }
  },
  methods: {
    backGo: function (event, fallback) {
      if (window.EurforexBack && typeof window.EurforexBack.go === "function") {
        if (event && event.preventDefault) event.preventDefault();
        window.EurforexBack.go(fallback);
      }
    },
    openModal: function () {
      this.modalOpen = true;
      this.submitMessage = "";
      this.submitError = false;
      try { document.body.style.overflow = "hidden"; } catch (e) {}
      var self = this;
      setTimeout(function () {
        if (self.$refs.firstField) self.$refs.firstField.focus();
      }, 50);
    },
    closeModal: function () {
      this.modalOpen = false;
      this.currencyPickerOpen = false;
      try { document.body.style.overflow = ""; } catch (e) {}
    },
    openCurrencyPicker: function () {
      this.currencyPickerOpen = true;
    },
    selectCurrency: function (code) {
      this.form.currency = normalizeFiatCode(code);
      this.currencyPickerOpen = false;
    },
    handleEscKey: function (e) {
      if (e.key !== "Escape") return;
      if (this.currencyPickerOpen) {
        this.currencyPickerOpen = false;
        return;
      }
      if (this.modalOpen) this.closeModal();
    },
    mapPayoutMethod: function (item) {
      return {
        id: item.id,
        currency: normalizeFiatCode(item.currency_code || DEFAULT_FIAT_CODE),
        accountName: item.account_holder || "—",
        bankName: item.bank_name || this.$t("phrases.銀行帳戶"),
        accountNo: item.account_no_masked || "—",
        swift: String(item.bank_swift || "").trim(),
        address: String(item.holder_address || "").trim(),
        // 修正前綁定的舊資料只有遮罩帳號，需由客戶補填完整帳號
        needsFullAccount: !String(item.account_no || "").trim() && /\*/.test(String(item.account_no_masked || "")),
        fullAccountInput: "",
        fixing: false,
        fixMessage: "",
        fixError: false
      };
    },
    fetchBankList: function () {
      var self = this;
      this.loading = true;
      this.loadError = "";
      userApi.payoutMethods()
        .then(function (data) {
          var items = (data && data.items) || [];
          self.bankList = items
            .filter(function (item) { return String(item.channel_type || "") === "bank"; })
            .map(function (item) { return self.mapPayoutMethod(item); });
        })
        .catch(function (error) {
          self.bankList = [];
          self.loadError = (error && error.message) || self.localizedText("銀行資料載入失敗", "Failed to load bank info");
        })
        .finally(function () {
          self.loading = false;
        });
    },
    submitFullAccount: function (card) {
      var value = String(card.fullAccountInput || "").replace(/\s+/g, "").toUpperCase();
      card.fixMessage = "";
      card.fixError = false;
      if (!value) return;
      var visibleTail = String(card.accountNo || "").replace(/\s+/g, "").replace(/^\*+/, "").toUpperCase();
      if (visibleTail && value.slice(-visibleTail.length) !== visibleTail) {
        card.fixError = true;
        card.fixMessage = this.localizedText("帳號末四碼與原資料不符", "The last 4 digits do not match the existing account");
        return;
      }
      var self = this;
      card.fixing = true;
      userApi.completePayoutMethodAccount(card.id, { account_no: value }).then(function () {
        self.accountCompletedNotice = self.localizedText("完整帳號已補填", "Account number completed");
        return self.fetchBankList();
      }).catch(function (error) {
        var code = error && error.payload && error.payload.error_code;
        card.fixError = true;
        if (code === "AUTH_PAYOUT_ACCOUNT_SUFFIX_MISMATCH") {
          card.fixMessage = self.localizedText("帳號末四碼與原資料不符", "The last 4 digits do not match the existing account");
        } else {
          card.fixMessage = (error && error.message) || self.localizedText("提交失敗，請稍後再試", "Submission failed, please try again later.");
        }
      }).finally(function () {
        card.fixing = false;
      });
    },
    handleSubmit: function () {
      var currency = normalizeFiatCode(this.form.currency);
      var accountName = (this.form.accountName || "").trim();
      var bankName = (this.form.bankName || "").trim();
      var bankAccount = (this.form.bankAccount || "").replace(/\s+/g, "").toUpperCase();
      var bankSwift = (this.form.bankSwift || "").replace(/\s+/g, "").toUpperCase();
      var holderAddress = (this.form.holderAddress || "").trim();
      this.submitMessage = "";
      this.submitError = false;
      if (!accountName || !bankName || !bankAccount) return;
      if (bankSwift && !/^[A-Z0-9]{8}(?:[A-Z0-9]{3})?$/.test(bankSwift)) {
        this.submitError = true;
        this.submitMessage = this.localizedText("BIC/SWIFT 格式不正確", "Invalid BIC/SWIFT format");
        return;
      }
      var self = this;
      this.submitting = true;
      userApi.createPayoutMethod({
        channel_type: "bank",
        currency_code: currency,
        account_holder: accountName,
        bank_name: bankName,
        account_no: bankAccount,
        bank_swift: bankSwift,
        holder_address: holderAddress
      }).then(function () {
        self.form = { currency: currency, bankName: "", bankAccount: "", bankSwift: "", accountName: "", holderAddress: "" };
        self.closeModal();
        return self.fetchBankList();
      }).catch(function (error) {
        self.submitError = true;
        self.submitMessage = (error && error.message) || self.localizedText("提交失敗，請稍後再試", "Submission failed, please try again later.");
      }).finally(function () {
        self.submitting = false;
      });
    }
  }
};
</script>

<style>
@import url("../../static/previews/shared/marble-bg.css");
@import url("../../static/previews/nc2c/css/preview-entry.css");
</style>

<style scoped>
.bound-bank-card {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 255, 0.98)),
    radial-gradient(circle at top right, rgba(59, 154, 232, 0.12), transparent 42%);
  border: 1.5px solid rgba(47, 115, 205, 0.22);
  border-radius: 22px;
  box-shadow: 0 14px 30px rgba(29, 80, 135, 0.09), inset 0 1px 0 rgba(255, 255, 255, 0.95);
  padding: 16px;
}
.bound-bank-card__head {
  align-items: flex-start;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}
.bound-bank-card__eyebrow {
  color: #64748b;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}
.bound-bank-card__title {
  color: #0f2742;
  font-size: 15px;
  font-weight: 900;
  margin-top: 3px;
}
.bound-bank-card__badge {
  background: rgba(47, 115, 205, 0.09);
  border: 1px solid rgba(47, 115, 205, 0.18);
  border-radius: 999px;
  color: #1e5cad;
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 900;
  padding: 4px 10px;
}
.bound-bank-card__fields {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}
.bound-bank-card__row {
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 14px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 10px 12px;
}
.bound-bank-card__row span {
  color: #64748b;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 800;
}
.bound-bank-card__row strong {
  color: #0f172a;
  flex: 1 1 auto;
  font-size: 13px;
  font-weight: 900;
  text-align: right;
  word-break: break-word;
}
.add-bank-dialog {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.99), rgba(248, 251, 255, 0.98)),
    radial-gradient(circle at top right, rgba(59, 154, 232, 0.16), transparent 46%) !important;
}
.add-bank-field {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 16px;
  padding: 12px;
}
.add-bank-field label {
  color: #64748b;
  display: block;
  font-size: 12px;
  font-weight: 900;
  margin-bottom: 8px;
}
.add-bank-field input {
  background: rgba(248, 251, 255, 0.92);
  border: 1.5px solid rgba(148, 163, 184, 0.28);
  border-radius: 14px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
  outline: none;
  padding: 11px 13px;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
  width: 100%;
}
.add-bank-field input:focus {
  background: #ffffff;
  border-color: rgba(47, 115, 205, 0.52);
  box-shadow: 0 0 0 3px rgba(47, 115, 205, 0.12);
}
.add-bank-field label em {
  background: rgba(100, 116, 139, 0.1);
  border-radius: 999px;
  color: #64748b;
  font-size: 10px;
  font-style: normal;
  font-weight: 800;
  letter-spacing: 0.04em;
  margin-left: 8px;
  padding: 2px 8px;
  vertical-align: middle;
}
.add-bank-select {
  align-items: center;
  background: rgba(248, 251, 255, 0.92);
  border: 1.5px solid rgba(148, 163, 184, 0.28);
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  gap: 12px;
  padding: 9px 12px;
  text-align: left;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
  width: 100%;
}
.add-bank-select:hover,
.add-bank-select:focus-visible {
  background: #ffffff;
  border-color: rgba(47, 115, 205, 0.52);
  box-shadow: 0 0 0 3px rgba(47, 115, 205, 0.12);
  outline: none;
}
.add-bank-select__body {
  display: grid;
  flex: 1 1 auto;
  gap: 2px;
  min-width: 0;
}
.add-bank-select__body strong {
  color: #0f172a;
  font-family: Space Grotesk, Manrope, sans-serif;
  font-size: 15px;
  font-weight: 900;
  line-height: 1.1;
}
.add-bank-select__body span {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.add-bank-select__chevron {
  color: #64748b;
  flex: 0 0 auto;
  font-size: 22px;
  line-height: 1;
}
.fiat-badge {
  align-items: center;
  background: linear-gradient(135deg, #3b8fe4, #1e5cad);
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(33, 79, 131, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.35);
  color: #ffffff;
  display: inline-flex;
  flex: 0 0 auto;
  font-family: Space Grotesk, Manrope, sans-serif;
  font-size: 15px;
  font-weight: 900;
  height: 36px;
  justify-content: center;
  letter-spacing: -0.02em;
  width: 36px;
}
.fiat-badge[data-code="CHF"] {
  background: linear-gradient(135deg, #f0655a, #b91c1c);
  font-size: 10px;
}
.fiat-badge[data-code="USD"] {
  background: linear-gradient(135deg, #22c58c, #047857);
}
.fiat-badge[data-code="GBP"] {
  background: linear-gradient(135deg, #9b7bf5, #5b21b6);
}
.fiat-badge--lg {
  font-size: 18px;
  height: 46px;
  width: 46px;
}
.fiat-badge--lg[data-code="CHF"] {
  font-size: 12px;
}
.fiat-picker-list {
  display: grid;
  gap: 10px;
  max-height: min(60vh, 440px);
  overflow-y: auto;
  padding: 2px;
}
.fiat-option {
  align-items: center;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(247, 252, 255, 0.84));
  border: 1.5px solid rgba(148, 163, 184, 0.22);
  border-radius: 18px;
  box-shadow: 0 12px 24px rgba(40, 88, 142, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.96);
  color: #16293f;
  cursor: pointer;
  display: grid;
  gap: 14px;
  grid-template-columns: 46px minmax(0, 1fr) auto;
  min-height: 72px;
  padding: 12px 14px;
  text-align: left;
  transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
  width: 100%;
}
.fiat-option:active {
  transform: scale(0.985);
}
.fiat-option--active {
  background: linear-gradient(135deg, rgba(232, 244, 255, 0.98), rgba(255, 255, 255, 0.96));
  border-color: rgba(47, 115, 205, 0.55);
  box-shadow: 0 0 0 3px rgba(47, 115, 205, 0.1), 0 12px 24px rgba(40, 88, 142, 0.08);
}
.fiat-option__body {
  display: grid;
  gap: 3px;
  min-width: 0;
}
.fiat-option__body strong {
  color: #16293f;
  font-family: Space Grotesk, Manrope, sans-serif;
  font-size: 19px;
  font-weight: 800;
  line-height: 1;
}
.fiat-option__body span {
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.fiat-option__mark {
  color: #94a3b8;
  font-size: 24px;
  line-height: 1;
}
.fiat-option--active .fiat-option__mark {
  color: #2f73cd;
}
/* iOS Safari：用 overlay 自己捲動（fixed inset-0 會跟著實際可視區變動），避免 90vh 被底部工具列蓋住 */
.add-bank-overlay {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
}
.add-bank-dialog {
  flex: 0 0 auto;
}
.bound-bank-card__fix {
  background: linear-gradient(135deg, rgba(255, 247, 230, 0.96), rgba(255, 255, 255, 0.9));
  border: 1.5px solid rgba(245, 158, 11, 0.38);
  border-radius: 16px;
  margin-top: 12px;
  padding: 12px;
}
.bound-bank-card__fix-text {
  color: #9a3412;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.5;
  margin: 0 0 10px;
}
.bound-bank-card__fix-form {
  display: flex;
  gap: 8px;
}
.bound-bank-card__fix-form input {
  background: #ffffff;
  border: 1.5px solid rgba(245, 158, 11, 0.45);
  border-radius: 12px;
  color: #0f172a;
  flex: 1 1 auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  font-weight: 700;
  min-width: 0;
  outline: none;
  padding: 10px 12px;
}
.bound-bank-card__fix-form input:focus {
  border-color: rgba(217, 119, 6, 0.8);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.16);
}
.bound-bank-card__fix-form button {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 900;
  padding: 0 12px;
  white-space: nowrap;
}
.bound-bank-card__fix-form button:disabled {
  opacity: 0.55;
}
.bound-bank-card__fix-hint {
  color: #92400e;
  font-size: 11px;
  font-weight: 700;
  margin: 8px 0 0;
}
.bound-bank-card__done {
  background: rgba(22, 163, 74, 0.1);
  border: 1.5px solid rgba(22, 163, 74, 0.35);
  border-radius: 14px;
  color: #15803d;
  font-size: 13px;
  font-weight: 800;
  margin: 0;
  padding: 10px 14px;
}
.bound-bank-card__fix-msg {
  font-size: 12px;
  font-weight: 800;
  margin: 6px 0 0;
}
</style>
