<template>
  <div>
    <header class="fixed top-0 w-full border-b border-primary/10 bg-white/75 backdrop-blur-3xl shadow-[0_12px_32px_rgba(33,79,131,0.08)] flex justify-between items-center px-6 h-14 w-full z-50">
      <a class="flex shrink-0 items-center justify-center rounded-full p-2 text-primary-dim transition-colors hover:bg-primary/10" href="#/pages/setting/wallet" @click="backGo($event, '#/pages/setting/wallet')"><span class="material-symbols-outlined">arrow_back</span></a>
      <div class="min-w-0 flex-1 px-1 text-center">
        <div class="font-headline text-lg font-bold leading-tight text-on-surface">{{ localizedText('法幣提現', 'Fiat Withdrawal') }}</div>
      </div>
      <a class="flex shrink-0 min-w-[2.5rem] items-center justify-center rounded-full p-2 text-sm font-bold text-primary-dim transition-colors hover:bg-primary/10" href="#/pages/setting/withdrawUsdt" :title="localizedText('改為 USDT 鏈上提現', 'Switch to USDT on-chain withdrawal')">USDT</a>
    </header>

      <main class="mx-auto max-w-lg px-4 pb-10 pb-safe pt-20">

      <p class="mb-3 flex items-start gap-2 rounded-2xl border border-primary/15 bg-primary-container/40 px-3.5 py-2.5 text-xs font-medium text-on-surface leading-relaxed">
        <span class="material-symbols-outlined mt-0.5 text-[18px] text-primary-dim shrink-0">account_balance</span>
        <span><span class="font-bold text-primary-dim">{{ selectedFiat.code }} {{ localizedText('銀行提領：', 'bank withdrawal:') }}</span>{{ localizedText('資金將匯入您已驗證的銀行帳戶，到帳時間受銀行與假日影響；提交後可在提領紀錄查看審核與放款狀態。', 'Funds will be sent to your verified bank account. Settlement usually depends on bank timing and holidays. You can check review and release status in withdrawal history.') }}</span>
      </p>

      <section class="fiat-card p-[18px]">
        <div class="mb-4">
          <div class="mb-2 text-sm font-semibold text-on-surface">{{ localizedText('選擇法幣幣種', 'Select fiat currency') }}</div>
          <div class="flex flex-wrap gap-2.5">
            <button
              v-for="fiat in fiatAssets"
              :key="fiat.code"
              type="button"
              class="fiat-currency-pill"
              :class="{ 'fiat-currency-pill--active': fiatCode === fiat.code }"
              @click="selectFiat(fiat.code)"
            >{{ fiat.code }}</button>
          </div>
        </div>
        <div class="flex items-start justify-between gap-3 border-b border-outline-variant/20 pb-4">
          <div>
            <p class="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">{{ localizedText('到帳方式', 'Arrival method') }}</p>
            <p class="mt-1 font-headline text-base font-bold text-on-surface">{{ localizedText('SEPA 本地轉帳', 'SEPA local transfer') }}</p>
            <p class="mt-1 text-xs text-on-surface-variant">{{ localizedText('通常 1～3 個銀行工作日內到帳', 'Usually 1 to 3 business days to settle') }}</p>
          </div>
          <span class="shrink-0 rounded-full bg-surface-container-high px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{{ selectedFiat.code }}</span>
        </div>

        <div class="mt-4">
          <div class="mb-2">
            <span class="text-sm font-semibold text-on-surface">{{ localizedText('收款銀行', 'Beneficiary bank') }}</span>
          </div>

          <div id="fiat-bank-empty" class="eurforex-empty-card eurforex-empty-card--compact" v-show="!selectedBank">
            <div class="eurforex-empty-illustration" aria-hidden="true">
              <span class="eurforex-empty-illustration__cube eurforex-empty-illustration__cube--one"></span>
              <span class="eurforex-empty-illustration__cube eurforex-empty-illustration__cube--two"></span>
              <span class="eurforex-empty-illustration__cube eurforex-empty-illustration__cube--three"></span>
              <span class="eurforex-empty-illustration__box"></span>
            </div>
            <div class="eurforex-empty-actions">
            <button type="button" id="open-bank-picker-empty" class="eurforex-empty-btn" @click="showModal">{{ localizedText('選擇收款銀行', 'Select receiving bank') }}</button>
            </div>
          </div>

          <div id="fiat-bank-selected" :class="selectedBank ? '' : 'hidden'" v-show="selectedBank">
            <div class="selected-bank-card">
              <div class="flex flex-wrap items-center gap-2">
                <span class="bank-card-title">{{ localizedText('已選擇收款銀行', 'Selected receiving bank') }}</span>
                <span id="fiat-bank-default-badge" class="rounded-md bg-primary-container/80 px-2 py-0.5 text-[10px] font-bold text-primary-dim" :class="{ hidden: !selectedBank || !selectedBank.default }">{{ localizedText('預設', 'Default') }}</span>
                <span class="rounded-md bg-surface-container-high px-2 py-0.5 text-[10px] font-bold text-on-surface-variant">{{ selectedBank ? selectedBank.currency : "" }}</span>
              </div>
              <div class="mt-3 space-y-2">
                <div class="bank-info-row">
                  <span>{{ localizedText('戶名', 'Account holder') }}</span>
                  <strong id="fiat-bank-holder">{{ selectedBank ? selectedBank.holder : '—' }}</strong>
                </div>
                <div class="bank-info-row">
                <span>{{ localizedText('銀行名', 'Bank name') }}</span>
                  <strong id="fiat-bank-name">{{ selectedBank ? selectedBank.name : '—' }}</strong>
                </div>
                <div class="bank-info-row">
                <span>{{ localizedText('銀行帳號', 'Bank account') }}</span>
                  <strong id="fiat-bank-iban" class="font-mono tracking-wide" :title="selectedBank ? selectedBank.iban : ''">{{ selectedBank ? selectedBank.iban : '—' }}</strong>
                </div>
              </div>
            </div>
            <p v-if="selectedBank && selectedBank.needsFullAccount" class="mt-3 rounded-xl border border-amber-300/70 bg-amber-50 px-3 py-2 text-xs font-bold leading-relaxed text-amber-800">{{ localizedText("此銀行帳戶尚未有完整帳號，請補填後才能用於提領。", "This bank account has no full account number yet. Please complete it before withdrawing.") }} <a class="underline" href="#/pages/setting/bindinfo">{{ localizedText("補填完整帳號", "Complete account number") }}</a></p>
            <button type="button" id="open-bank-picker-change" class="mt-3 w-full rounded-xl border border-outline-variant/30 bg-white py-2.5 text-sm font-bold text-primary-dim transition-colors hover:bg-surface-container-low" @click="showModal">{{ localizedText('選擇其他銀行', 'Choose another bank') }}</button>
          </div>
        </div>

        <div class="mt-6">
          <label class="mb-2 block text-sm font-semibold text-on-surface" for="fiat-amount">{{ localizedText('提現金額', 'Withdrawal amount') }}</label>
          <div class="flex min-h-[56px] items-center gap-2 rounded-[18px] border border-outline-variant/35 bg-gradient-to-b from-white to-surface-container-low/90 px-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] sm:px-4">
            <input class="min-w-0 flex-1 border-0 bg-transparent text-2xl font-headline font-bold tracking-tight text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-0" id="fiat-amount" inputmode="decimal" autocomplete="off" placeholder="0.00" type="text" v-model="amount" />
            <span class="shrink-0 border-l border-outline-variant/25 pl-3 text-sm font-extrabold text-on-surface">{{ selectedFiat.code }}</span>
            <button class="shrink-0 rounded-xl bg-primary-container/70 px-3 py-1.5 text-xs font-bold text-primary-dim hover:bg-primary-container" id="fiat-max" type="button" @click="fillMax">{{ localizedText('全部', 'All') }}</button>
          </div>
          <p class="fiat-soft-note mt-2 text-xs text-on-surface-variant">{{ localizedText('單筆最低', 'Single minimum') }} <span class="font-semibold text-on-surface">{{ selectedFiat.code }} 20.00</span> · {{ localizedText('需預留手續費', 'Service fee applies') }}</p>
        </div>
      </section>

      <section class="fiat-card mt-4 p-[18px]">
        <h2 class="font-headline text-sm font-bold text-on-surface">{{ localizedText("費用與預覽", "Fees and Preview") }}</h2>
        <dl class="mt-4 space-y-3 text-sm">
          <div class="flex items-center justify-between gap-4">
            <dt class="text-on-surface-variant">{{ localizedText("可用餘額", "Available balance") }}</dt>
            <dd class="font-semibold tabular-nums">{{ formatFiat(maxBal) }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4">
            <dt class="text-on-surface-variant">{{ localizedText("平台手續費", "Platform fee") }}</dt>
            <dd class="font-semibold tabular-nums text-on-surface">{{ feeDisplay }}</dd>
          </div>
          <div class="h-px bg-outline-variant/25"></div>
          <div class="flex items-center justify-between gap-4">
            <dt class="font-semibold text-on-surface">{{ localizedText("預計到帳（扣除費用後）", "Estimated arrival after fee") }}</dt>
            <dd class="font-headline text-lg font-bold tabular-nums text-primary-dim" id="fiat-net">{{ netDisplay }}</dd>
          </div>
        </dl>
        <button
          type="button"
          class="usdt-confirm mt-5 flex h-[52px] w-full items-center justify-center rounded-full font-headline text-base font-bold tracking-wide"
          :disabled="submitting"
          @click="goWithdrawDetailFiat"
        >{{ submitting ? localizedText("提交中...", "Submitting...") : localizedText("確認提現", "Confirm withdrawal") }}</button>
      </section>
    </main>

    <Nc2cCenterSheet :visible.sync="modalOpen" :title="localizedText('選擇收款銀行', 'Select bank account')" title-id="bank-picker-title">
      <div class="bank-picker-shell">
        <p class="bank-picker-desc">{{ localizedText("請選擇本次提現要使用的銀行帳戶，確認後提現頁只會帶入該筆收款資料。", "Select the bank account for this withdrawal; the selected account will be auto-filled on the withdrawal page.") }}</p>
      <a
        href="#/pages/setting/bindinfo"
        class="bank-picker-add-btn"
        @click="hideModal"
      >
        <span class="material-symbols-outlined text-[18px]">add_card</span>
        <span>{{ localizedText("新增銀行", "Add bank") }}</span>
      </a>
      <div id="bank-picker-list" class="bank-picker-list">
        <p v-if="!banksForFiat.length" class="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-8 text-center text-sm text-on-surface-variant">{{ banks.length ? localizedText("此貨幣尚未綁定銀行帳戶，請先新增。", "No bank account is bound for this currency yet. Please add one first.") : localizedText("尚未綁定銀行帳戶，請先新增銀行。", "No bank account is bound yet, please add one first.") }}</p>
        <button
          v-for="b in banksForFiat"
          :key="b.id"
          type="button"
          class="bank-pick"
          :class="{ 'bank-pick--selected': pendingId === b.id }"
          :data-id="b.id"
          @click="pendingId = b.id"
        >
          <div class="bank-pick-head">
            <div>
              <span class="bank-pick-title">{{ localizedText("銀行收款帳戶", "Bank account") }}</span>
              <span v-if="b.default" class="bank-pick-badge">{{ localizedText("預設", "Default") }}</span>
              <span class="bank-pick-badge">{{ b.currency }}</span>
              <span v-if="b.needsFullAccount" class="bank-pick-badge bank-pick-badge--warn">{{ localizedText("需補填完整帳號", "Full account number required") }}</span>
            </div>
            <span class="bank-pick-radio" aria-hidden="true"></span>
          </div>
          <div class="bank-pick-fields">
            <div class="bank-pick-field">
              <span>{{ localizedText("戶名", "Account holder") }}</span>
              <strong>{{ b.holder }}</strong>
            </div>
            <div class="bank-pick-field">
              <span>{{ localizedText("銀行名", "Bank name") }}</span>
              <strong>{{ b.name }}</strong>
            </div>
            <div class="bank-pick-field">
              <span>{{ localizedText("銀行帳號", "Bank account") }}</span>
              <strong class="font-mono tracking-wide" :title="b.iban">{{ b.iban }}</strong>
            </div>
            <div v-if="b.swift" class="bank-pick-field">
              <span>BIC/SWIFT</span>
              <strong class="font-mono tracking-wide">{{ b.swift }}</strong>
            </div>
          </div>
        </button>
      </div>
      <div class="mt-5 flex gap-3">
        <button type="button" id="bank-picker-cancel" class="flex-1 rounded-full border-2 border-slate-300 bg-white py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50" @click="hideModal">{{ localizedText("取消", "Cancel") }}</button>
        <button type="button" id="bank-picker-confirm" class="bank-picker-confirm-btn flex-1 rounded-full py-3 text-sm font-bold text-white shadow-[0_10px_22px_rgba(47,115,205,0.35)]" @click="confirmPicker">{{ localizedText("確定", "Confirm") }}</button>
      </div>
      </div>
    </Nc2cCenterSheet>

    <div class="fiat-notice-overlay" :class="{ open: noticeOpen }" role="dialog" aria-modal="true" aria-labelledby="fiat-notice-title" @click.self="closeNotice">
      <div class="fiat-notice-dialog">
        <div class="fiat-notice-icon" aria-hidden="true">
          <span class="material-symbols-outlined">info</span>
        </div>
        <h2 id="fiat-notice-title">{{ noticeTitle }}</h2>
        <p>{{ noticeMessage }}</p>
        <button type="button" class="fiat-notice-btn" @click="closeNotice">{{ localizedText("我知道了", "Got it") }}</button>
      </div>
    </div>

  </div>
</template>

<script>
import { userApi } from '@/utils/api'
import { formatTruncatedAmount, trimTruncatedNumber } from '@/utils/amountFormat'
import { getStoredLang } from '@/common/langStorage'
import { normalizeFiatCode } from '@/common/fiatCurrencies'

/**
 * EURFOREX - 法幣提現 (純 H5 Vue2 Options API)
 * 以 docs/previews/nnn/withdraw.html 為唯一基準逐字遷移
 * 外部腳本：../shared/marble-bg.js、../shared/back-nav.js（動態注入）
 * 原稿內聯 IIFE 遷移：
 *   STORAGE_KEY = "eurforex-fiat-withdraw-bank-id" → sessionStorage
 *   BANKS 資料、選擇 modal、金額輸入 → Vue data/methods/computed
 */
var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--withdraw",
  "font-body",
  "min-h-screen",
  "bg-background",
  "pb-8",
  "text-on-surface",
  "antialiased"
];

var STORAGE_KEY = "eurforex-fiat-withdraw-bank-id";
export default {
  name: "WithdrawH5",
  data: function () {
    return {
      banks: [],
      selectedId: "",
      pendingId: null,
      modalOpen: false,
      fiatCode: "EUR",
      fiatAssets: [
        { code: "EUR", wallet: "eur" },
        { code: "CHF", wallet: "chf" },
        { code: "USD", wallet: "usd" },
        { code: "GBP", wallet: "gbp" }
      ],
      walletMap: {},
      amount: "",
      fee: 5,
      maxBal: 0,
      submitting: false,
      noticeOpen: false,
      noticeTitle: "",
      noticeMessage: ""
    };
  },
  computed: {
    selectedBank: function () {
      if (!this.selectedId) return null;
      for (var i = 0; i < this.banks.length; i++) {
        if (this.banks[i].id === this.selectedId) return this.banks[i];
      }
      return null;
    },
    banksForFiat: function () {
      var code = this.selectedFiat.code;
      return this.banks.filter(function (b) { return (b.currency || "EUR") === code; });
    },
    selectedFiat: function () {
      for (var i = 0; i < this.fiatAssets.length; i++) {
        if (this.fiatAssets[i].code === this.fiatCode) return this.fiatAssets[i];
      }
      return this.fiatAssets[0];
    },
    netDisplay: function () {
      var raw = this.amount ? String(this.amount).replace(/,/g, "").trim() : "";
      if (!raw) return "—";
      var n = parseFloat(raw);
      if (isNaN(n)) n = 0;
      var net = n - this.fee;
      if (net <= 0) return this.formatFiat(0);
      return this.formatFiat(net);
    },
    feeDisplay: function () {
      return this.formatFiat(this.fee);
    }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) {
        document.body.classList.add(BODY_CLASSES[i]);
      }
      document.body.setAttribute("data-nc2c-page", "withdraw");
      document.body.setAttribute("data-nc2c-locked", "true");
    } catch (e) {}
    try {
      this.selectedId = sessionStorage.getItem(STORAGE_KEY) || "";
    } catch (e) {}
    this.loadSharedScript("/static/previews/shared/marble-bg.js", "eurforexMarbleBgJs");
    this.loadSharedScript("/static/previews/shared/back-nav.js", "eurforexBackNav");
    this.loadPageData();
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
  },
  methods: {
    backGo: function (event, fallback) {
      if (window.EurforexBack && typeof window.EurforexBack.go === "function") {
        if (event && event.preventDefault) event.preventDefault();
        window.EurforexBack.go(fallback);
      }
    },
    formatFiat: function (n) {
      return this.selectedFiat.code + " " + formatTruncatedAmount(n, 2);
    },
    selectFiat: function (code) {
      this.fiatCode = String(code || "EUR").toUpperCase();
      this.amount = "";
      this.applyFiatBalance();
      this.syncSelectedBankWithFiat();
    },
    /** 只保留與所選法幣相同幣別的銀行帳戶；目前選擇不符合時改選該幣別的預設或第一筆 */
    syncSelectedBankWithFiat: function () {
      var list = this.banksForFiat;
      var current = this.selectedBank;
      if (current && list.some(function (b) { return b.id === current.id; })) return;
      var picked = list.find(function (b) { return b.default; }) || list[0] || null;
      this.selectedId = picked ? picked.id : "";
    },
    applyFiatBalance: function () {
      var wallet = this.walletMap[this.selectedFiat.wallet] || {};
      this.maxBal = parseFloat(wallet.available_balance || "0") || 0;
    },
    loadPageData: function () {
      var self = this;
      userApi
        .overview()
        .then(function (data) {
          var map = (data && data.wallet_map) || {};
          self.walletMap = map;
          self.applyFiatBalance();
        })
        .catch(function () {
          self.maxBal = 0;
        });
      userApi
        .payoutMethods()
        .then(function (data) {
          var items = (data && data.items) || [];
          self.banks = items
            .filter(function (it) {
              return String(it.channel_type || "") === "bank" && String(it.status || "") === "approved";
            })
            .map(function (it) {
              return {
                id: String(it.id),
                name: it.bank_name || "銀行帳戶",
                default: !!it.is_default,
                holder: it.account_holder || "—",
                iban: String(it.account_no || "").trim() || it.account_no_masked || "—",
                currency: normalizeFiatCode(it.currency_code || "EUR"),
                swift: String(it.bank_swift || "").trim(),
                needsFullAccount: !String(it.account_no || "").trim() && /\*/.test(String(it.account_no_masked || ""))
              };
            });
          self.syncSelectedBankWithFiat();
        })
        .catch(function () {
          self.banks = [];
        });
    },
    showModal: function () {
      var cur = "";
      try { cur = sessionStorage.getItem(STORAGE_KEY) || ""; } catch (e) {}
      var list = this.banksForFiat;
      var valid = list.some(function (b) { return b.id === cur; });
      this.pendingId = (valid ? cur : "") || (list[0] && list[0].id) || null;
      this.modalOpen = true;
    },
    hideModal: function () {
      this.modalOpen = false;
    },
    showNotice: function (message, title) {
      this.noticeTitle = title || this.localizedText("提示", "Notice");
      this.noticeMessage = message || this.localizedText("操作失敗，請稍後再試。", "Failed, please try again later.");
      this.noticeOpen = true;
    },
    closeNotice: function () {
      this.noticeOpen = false;
    },
    withdrawalErrorMessage: function (error) {
      var code = error && error.payload && error.payload.error_code;
      var msg = error && error.payload && error.payload.msg ? String(error.payload.msg) : "";
      if (code === "AUTH_TOKEN_INVALID" || code === "AUTH_TOKEN_EXPIRED" || code === "AUTH_UNAUTHORIZED") return this.localizedText("登入狀態已失效，請重新登入後再提交。", "Your login has expired. Please sign in again before submit.");
      if (code === "AUTH_INVALID_PARAMS" && /Insufficient balance/i.test(msg)) return this.localizedText("可用餘額不足，請確認提現金額與手續費。", "Insufficient balance. Please check the amount and withdrawal fee.");
      return (error && error.message) || this.localizedText("提現申請提交失敗，請稍後再試。", "Withdrawal request submission failed. Please try again later.");
    },
    confirmPicker: function () {
      if (this.pendingId) {
        try { sessionStorage.setItem(STORAGE_KEY, this.pendingId); } catch (e) {}
        this.selectedId = this.pendingId;
      }
      this.hideModal();
    },
    fillMax: function () {
      this.amount = trimTruncatedNumber(this.maxBal, 2);
    },
    goWithdrawDetailFiat: function () {
      var n = parseFloat(String(this.amount || "").replace(/,/g, "").trim());
      if (this.selectedBank && this.selectedBank.needsFullAccount) {
        this.showNotice(this.localizedText("此銀行帳戶尚未有完整帳號，請補填後才能用於提領。", "This bank account has no full account number yet. Please complete it before withdrawing."));
        return;
      }
      if (!this.selectedBank) {
        this.showNotice(
          this.localizedText("請先選擇本次提現要使用的收款銀行。", "Please select a beneficiary bank first."),
          this.localizedText("尚未選擇銀行", "Bank not selected")
        );
        return;
      }
      if (isNaN(n) || n < 20) {
        this.showNotice(
          this.localizedText("單筆法幣提現金額需至少 ", "The minimum single fiat withdrawal amount is ") + this.selectedFiat.code + " 20.00。",
          this.localizedText("金額未達最低限制", "Amount below minimum")
        );
        return;
      }
      if (n > this.maxBal) {
        this.showNotice(
          this.localizedText("可用餘額不足，請調整提現金額或先完成充值。", "Insufficient available balance. Please adjust the amount or top up first."),
          this.localizedText("餘額不足", "Insufficient balance")
        );
        return;
      }
      if (this.submitting) return;
      var self = this;
      this.submitting = true;
      userApi
        .createWithdrawalRequest({
          amount: n.toFixed(8),
          channel_type: "bank",
          asset_code: this.selectedFiat.code,
          source_wallet_code: this.selectedFiat.wallet,
          payout_method_id: this.selectedBank.id
        })
        .then(function (data) {
          window.location.href = "#/pages/setting/withdrawDetailFiat?id=" + (data.withdrawal_request_id || data.request_id || "");
        })
        .catch(function (error) {
          self.showNotice(
            self.withdrawalErrorMessage(error),
            self.localizedText("提現申請未送出", "Request not submitted")
          );
        })
        .finally(function () {
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
/* 銀行選擇彈窗：與全域 preview 按鈕覆寫脫鉤，確保主按鈕與選中列對比足夠 */
.selected-bank-card {
  border: 1.5px solid rgba(47, 115, 205, 0.34);
  border-radius: 20px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(240, 248, 255, 0.96)),
    radial-gradient(circle at top right, rgba(59, 154, 232, 0.15), transparent 40%);
  box-shadow: 0 14px 30px rgba(29, 80, 135, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.95);
  padding: 16px;
}
.bank-card-title {
  color: #0f2742;
  font-family: inherit;
  font-size: 15px;
  font-weight: 800;
}
.bank-info-row {
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.74);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 14px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 10px 12px;
}
.bank-info-row span {
  color: #64748b;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 700;
}
.bank-info-row strong {
  color: #0f172a;
  flex: 1 1 auto;
  font-size: 13px;
  font-weight: 800;
  text-align: right;
  word-break: break-word;
}
.bank-picker-shell {
  margin-top: 8px;
}
.bank-picker-desc {
  background: linear-gradient(135deg, rgba(239, 248, 255, 0.95), rgba(255, 255, 255, 0.96));
  border: 1px solid rgba(47, 115, 205, 0.14);
  border-radius: 16px;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.65;
  padding: 12px 14px;
}
.bank-picker-add-btn {
  align-items: center;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(238, 247, 255, 0.96));
  border: 1.5px solid rgba(47, 115, 205, 0.24);
  border-radius: 18px;
  box-shadow: 0 10px 24px rgba(29, 80, 135, 0.08);
  color: #1e5cad;
  display: flex;
  font-size: 14px;
  font-weight: 800;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
  padding: 12px 14px;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
  width: 100%;
}
.bank-picker-add-btn:hover {
  background: #f8fbff;
  box-shadow: 0 12px 28px rgba(29, 80, 135, 0.12);
  transform: translateY(-1px);
}
.bank-picker-list {
  margin-top: 14px;
  max-height: min(52vh, 380px);
  overflow-y: auto;
  padding: 2px 2px 4px;
}
.bank-pick {
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(248, 251, 255, 0.98)),
    radial-gradient(circle at top right, rgba(59, 154, 232, 0.1), transparent 38%);
  border: 1.5px solid rgba(148, 163, 184, 0.34);
  border-radius: 20px;
  box-shadow: 0 12px 28px rgba(15, 39, 66, 0.08);
  display: block;
  margin-bottom: 10px;
  padding: 14px;
  text-align: left;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, transform 0.16s ease;
  width: 100%;
}
.bank-pick:hover {
  border-color: rgba(47, 115, 205, 0.38);
  box-shadow: 0 16px 32px rgba(29, 80, 135, 0.12);
  transform: translateY(-1px);
}
.bank-pick--selected {
  background:
    linear-gradient(135deg, rgba(239, 248, 255, 0.98), rgba(255, 255, 255, 0.98)),
    radial-gradient(circle at top right, rgba(59, 154, 232, 0.18), transparent 44%);
  border-color: #2f73cd;
  box-shadow: 0 16px 36px rgba(47, 115, 205, 0.18), 0 0 0 3px rgba(47, 115, 205, 0.12);
}
.bank-pick-head {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: space-between;
}
.bank-pick-title {
  color: #0f2742;
  font-size: 14px;
  font-weight: 900;
}
.bank-pick-badge {
  background: #ffffff;
  border: 1px solid rgba(47, 115, 205, 0.28);
  border-radius: 999px;
  color: #1e5cad;
  display: inline-flex;
  font-size: 10px;
  font-weight: 900;
  margin-left: 8px;
  padding: 2px 8px;
}
.bank-pick-badge--warn {
  background: rgba(245, 158, 11, 0.16);
  border-color: rgba(245, 158, 11, 0.5);
  color: #b45309;
}
.bank-pick-radio {
  border: 2px solid rgba(100, 116, 139, 0.36);
  border-radius: 999px;
  flex: 0 0 18px;
  height: 18px;
  position: relative;
  width: 18px;
}
.bank-pick--selected .bank-pick-radio {
  border-color: #2f73cd;
}
.bank-pick--selected .bank-pick-radio::after {
  background: #2f73cd;
  border-radius: 999px;
  content: "";
  height: 8px;
  left: 3px;
  position: absolute;
  top: 3px;
  width: 8px;
}
.bank-pick-fields {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}
.bank-pick-field {
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 14px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 9px 11px;
}
.bank-pick-field span {
  color: #64748b;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 800;
}
.bank-pick-field strong {
  color: #0f172a;
  flex: 1 1 auto;
  font-size: 13px;
  font-weight: 900;
  text-align: right;
  word-break: break-word;
}
.bank-picker-confirm-btn {
  background: linear-gradient(135deg, #3b9ae8, #1e5cad) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.55) !important;
  text-shadow: 0 1px 2px rgba(0, 36, 76, 0.25);
}
.bank-picker-confirm-btn:hover {
  filter: brightness(1.05);
}
.fiat-notice-overlay {
  align-items: center;
  background: rgba(10, 27, 47, 0.46);
  backdrop-filter: blur(10px);
  display: flex;
  inset: 0;
  justify-content: center;
  opacity: 0;
  padding: 22px;
  pointer-events: none;
  position: fixed;
  transition: opacity 0.18s ease;
  z-index: 80;
}
.fiat-notice-overlay.open {
  opacity: 1;
  pointer-events: auto;
}
.fiat-notice-dialog {
  align-items: center;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.99), rgba(239, 248, 255, 0.98)),
    radial-gradient(circle at top right, rgba(59, 154, 232, 0.2), transparent 42%);
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 28px;
  box-shadow: 0 28px 72px rgba(9, 35, 68, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.96);
  display: flex;
  flex-direction: column;
  max-width: 360px;
  padding: 26px 22px 22px;
  text-align: center;
  transform: translateY(8px) scale(0.98);
  transition: transform 0.18s ease;
  width: min(88vw, 360px);
}
.fiat-notice-overlay.open .fiat-notice-dialog {
  transform: translateY(0) scale(1);
}
.fiat-notice-icon {
  align-items: center;
  background: linear-gradient(135deg, #3b9ae8, #1e5cad);
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(47, 115, 205, 0.28);
  color: #ffffff;
  display: flex;
  height: 52px;
  justify-content: center;
  margin-bottom: 14px;
  width: 52px;
}
.fiat-notice-icon .material-symbols-outlined {
  font-size: 30px;
}
.fiat-notice-dialog h2 {
  color: #10243f;
  font-size: 20px;
  font-weight: 900;
  margin: 0;
}
.fiat-notice-dialog p {
  color: #5b7190;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.65;
  margin: 10px 0 0;
}
.fiat-notice-btn {
  background: linear-gradient(135deg, #3b9ae8, #1e5cad);
  border: 0;
  border-radius: 999px;
  box-shadow: 0 12px 24px rgba(47, 115, 205, 0.25);
  color: #ffffff;
  font-size: 14px;
  font-weight: 900;
  margin-top: 18px;
  min-height: 44px;
  padding: 0 28px;
  width: 100%;
}
</style>

<style scoped>
.fiat-currency-pill {
  min-width: 70px;
  height: 38px;
  border: 1px solid rgba(146, 176, 214, 0.38);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: #667891;
  font-size: 14px;
  font-weight: 850;
  box-shadow: 0 8px 18px rgba(29, 80, 135, 0.06), inset 0 1px 0 rgba(255,255,255,0.9);
}

.fiat-currency-pill--active {
  border-color: rgba(65, 107, 216, 0.55);
  background: linear-gradient(180deg, #eef4ff, #f9fcff);
  color: #416bd8;
  box-shadow: 0 10px 20px rgba(65, 107, 216, 0.15), inset 0 1px 0 rgba(255,255,255,0.96);
}
</style>
