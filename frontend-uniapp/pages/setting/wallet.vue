<template>
  <div>
    <header class="fixed top-0 w-full border-b border-primary/10 bg-white/75 backdrop-blur-3xl shadow-[0_12px_32px_rgba(33,79,131,0.08)] flex justify-between items-center px-6 h-14 w-full z-50">
      <a class="flex shrink-0 items-center justify-center rounded-full p-2 text-primary-dim transition-colors hover:bg-primary/10" href="#/pages/setting/user" @click="backGo($event, '#/pages/setting/user')"><span class="material-symbols-outlined">arrow_back</span></a>
      <div class="font-headline text-lg font-bold text-on-surface">{{ localizedText("我的資產", "My Assets") }}</div>
      <a class="flex shrink-0 items-center justify-center rounded-full p-2 text-primary-dim transition-colors hover:bg-primary/10 scale-95 active:duration-150" href="#/pages/setting/fundRecord" @click="openFundRecords"><span class="material-symbols-outlined">history</span></a>
    </header>
    <main class="pt-20 px-4 max-w-3xl mx-auto space-y-5">
      <section class="glass-panel rounded-[24px] p-5 overflow-hidden relative">
        <div class="absolute inset-0 bg-gradient-to-br from-primary-fixed/70 via-white/60 to-primary-container/70 opacity-90"></div>
        <div class="relative z-10">
          <div class="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">{{ localizedText("預設法幣餘額", "Default fiat balance") }}</div>
          <div id="wallet-total-estimate" class="font-headline text-4xl mt-2 tabular-nums">{{ totalEstimateDisplay }}</div>
          <div v-if="walletLoading" class="mt-2 inline-flex items-center gap-2 text-xs text-on-surface-variant" :aria-label="localizedText('資產同步中', 'Syncing assets')">
            <span class="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></span>
          </div>
          <div v-else-if="walletError" class="mt-2 text-xs text-error">{{ walletError }}</div>
        </div>
      </section>
      <section class="space-y-2 sm:space-y-3" :aria-label="localizedText('快捷充值與提領', 'Quick top-up and withdrawal')">
        <div class="grid grid-cols-2 gap-2 sm:gap-3">
          <a class="glass-panel rounded-[24px] p-4 sm:p-5 text-center" href="#/pages/setting/mixrecharge" :title="localizedText('USDT 鏈上充值', 'On-chain USDT top up')"><span class="material-symbols-outlined text-primary text-[1.85rem] leading-none sm:text-4xl">south_west</span><div class="font-semibold mt-2 sm:mt-2.5 text-base sm:text-lg leading-snug">{{ localizedText("USDT 充值", "USDT top up") }}</div></a>
          <button type="button" class="glass-panel rounded-[24px] p-4 sm:p-5 text-center w-full font-body border-0 cursor-pointer appearance-none text-on-surface" :title="localizedText('法幣充值', 'Fiat top up')" @click="openFiatRechargeModal"><span class="material-symbols-outlined text-primary text-[1.85rem] leading-none sm:text-4xl">savings</span><div class="font-semibold mt-2 sm:mt-2.5 text-base sm:text-lg leading-snug">{{ localizedText("法幣充值", "Fiat top up") }}</div></button>
        </div>
        <div class="grid grid-cols-3 gap-2 sm:gap-3">
          <a class="glass-panel rounded-[24px] p-4 sm:p-5 text-center" href="#/pages/setting/withdrawUsdt" :title="$t('phrases.USDT 鏈上提領')"><span class="material-symbols-outlined text-primary text-[1.85rem] leading-none sm:text-4xl">currency_bitcoin</span><div class="font-semibold mt-2 sm:mt-2.5 text-[15px] sm:text-lg leading-snug">{{ localizedText("USDT 提領", "USDT withdrawal") }}</div></a>
          <a class="glass-panel rounded-[24px] p-4 sm:p-5 text-center" href="#/pages/setting/withdraw" :title="localizedText('法幣提現', 'Fiat withdrawal')"><span class="material-symbols-outlined text-primary text-[1.85rem] leading-none sm:text-4xl">payments</span><div class="font-semibold mt-2 sm:mt-2.5 text-[15px] sm:text-lg leading-snug">{{ localizedText("法幣提現", "Fiat withdrawal") }}</div></a>
          <a class="glass-panel rounded-[24px] p-4 sm:p-5 text-center ring-1 ring-primary/20" href="#/pages/setting/eurSwapWithdraw" :title="localizedText('EUR 換 USDT 提領', 'Swap EUR to USDT')"><span class="material-symbols-outlined text-primary text-[1.85rem] leading-none sm:text-4xl">currency_exchange</span><div class="font-semibold mt-2 sm:mt-2.5 text-[15px] sm:text-lg leading-snug">{{ localizedText("換匯提領", "Exchange withdrawal") }}</div></a>
        </div>
      </section>
      <div id="fiat-recharge-service-modal" class="fixed inset-0 z-[120] items-center justify-center bg-black/45 p-4" :class="fiatRechargeModalOpen ? 'flex' : 'hidden'" role="dialog" aria-modal="true" aria-labelledby="fiat-recharge-service-title" @click.self="closeFiatRechargeModal">
        <div class="relative w-full max-w-sm rounded-2xl border border-primary/10 bg-white p-5 pt-6 shadow-[0_12px_40px_rgba(33,79,131,0.12)]" @click.stop>
          <button
            type="button"
            class="absolute right-2 top-2 rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
            :aria-label="localizedText('關閉', 'Close')"
            @click="closeFiatRechargeModal"
          >
            <span class="material-symbols-outlined text-[22px] leading-none">close</span>
          </button>
          <h2 id="fiat-recharge-service-title" class="font-headline px-8 text-center text-lg font-bold text-on-surface">{{ localizedText("法幣充值", "Fiat top up") }}</h2>
          <p class="mt-4 text-center text-sm leading-relaxed text-on-surface">{{ localizedText("請聯繫客服", "Please contact support") }}</p>
          <button type="button" class="mt-6 w-full rounded-full border border-primary/25 bg-primary-container/60 py-3 text-sm font-bold text-primary-dim transition-colors hover:bg-primary-container" @click="closeFiatRechargeModal">{{ localizedText("知道了", "Got it") }}</button>
        </div>
      </div>
      <section class="glass-panel rounded-[24px] p-5">
        <div class="flex items-center justify-between mb-4"><h2 class="font-headline text-xl">{{ localizedText("資產分布", "Asset allocation") }}</h2><a class="text-sm text-primary-dim font-semibold" href="#/pages/setting/fundRecord" @click="openFundRecords">{{ localizedText("資金明細", "Funds details") }}</a></div>
        <div class="space-y-3">
          <div v-for="crypto in visibleCryptoWallets" :key="crypto.wallet_code" class="rounded-2xl bg-surface-bright px-4 py-4">
            <div class="flex items-center justify-between gap-3">
              <div class="font-semibold">{{ crypto.currency_code }}</div>
              <div class="text-right"><div :id="'wallet-' + String(crypto.currency_code).toLowerCase() + '-available'" class="font-headline text-xl">{{ walletAmount(crypto.wallet_code, crypto.decimals) }}</div><div class="text-xs text-on-surface-variant">{{ localizedText("凍結", "Frozen") }} {{ walletReserved(crypto.wallet_code, crypto.decimals) }}</div></div>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <a class="wallet-asset-action flex h-11 items-center justify-center rounded-xl border border-primary/25 bg-primary-container/50 text-base font-bold text-primary-dim transition-colors hover:bg-primary-container" href="#/pages/setting/mixrecharge">{{ localizedText("充值", "Top up") }}</a>
              <a class="wallet-asset-action wallet-asset-action--secondary flex h-11 items-center justify-center rounded-xl text-base font-bold transition-all border-0 cursor-pointer font-body" href="#/pages/setting/withdrawUsdt">{{ localizedText("提領", "Withdraw") }}</a>
            </div>
          </div>
          <div v-for="fiat in visibleFiatWallets" :key="fiat.wallet_code" class="rounded-2xl bg-surface-bright px-4 py-4">
            <div class="flex items-center justify-between gap-3">
              <div class="font-semibold">{{ fiat.currency_code }}</div>
              <div class="text-right"><div class="font-headline text-xl">{{ walletAmount(fiat.wallet_code) }}</div><div class="text-xs text-on-surface-variant">{{ localizedText("凍結", "Frozen") }} {{ walletReserved(fiat.wallet_code) }}</div></div>
            </div>
            <div class="mt-3 grid grid-cols-3 gap-2">
              <a v-if="fiat.currency_code === 'EUR'" class="wallet-asset-action flex h-11 items-center justify-center rounded-xl border border-primary/25 bg-primary-container/50 text-sm sm:text-base font-bold text-primary-dim transition-colors hover:bg-primary-container px-1" href="#/pages/setting/eurDeposit">{{ localizedText("充值", "Top up") }}</a>
              <button v-else type="button" class="wallet-asset-action flex h-11 items-center justify-center rounded-xl border border-primary/25 bg-primary-container/50 text-sm sm:text-base font-bold text-primary-dim transition-colors hover:bg-primary-container px-1 font-body" @click="openFiatRechargeModal">{{ localizedText("充值", "Top up") }}</button>
              <a v-if="fiat.currency_code === 'EUR'" class="wallet-asset-action wallet-asset-action--secondary flex h-11 items-center justify-center rounded-xl text-sm sm:text-base font-bold transition-all px-1" href="#/pages/setting/withdraw">{{ localizedText("提領", "Withdraw") }}</a>
              <button v-else type="button" class="wallet-asset-action wallet-asset-action--secondary flex h-11 items-center justify-center rounded-xl text-sm sm:text-base font-bold transition-all px-1 font-body" @click="openFiatRechargeModal">{{ localizedText("提領", "Withdraw") }}</button>
              <a v-if="fiat.currency_code === 'EUR'" class="wallet-asset-action wallet-asset-action--outline flex h-11 items-center justify-center rounded-xl text-sm sm:text-base font-bold transition-all px-1" href="#/pages/setting/eurSwapWithdraw" :title="localizedText('換匯', 'Exchange')">{{ localizedText("換匯", "Exchange") }}</a>
              <button v-else type="button" class="wallet-asset-action wallet-asset-action--outline flex h-11 items-center justify-center rounded-xl text-sm sm:text-base font-bold transition-all px-1 font-body" @click="openFiatRechargeModal" :title="localizedText('換匯', 'Exchange')">{{ localizedText("換匯", "Exchange") }}</button>
            </div>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
import { userApi } from '@/utils/api'

/*
 *  */
var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--wallet",
  "font-body",
  "antialiased",
  "min-h-screen",
  "bg-background",
  "text-on-surface",
  "pb-24"
];

export default {
  name: "WalletH5",
  data: function () {
    return {
      fiatRechargeModalOpen: false,
      walletLoading: false,
      walletError: "",
      walletMap: {},
      userProfile: {},
      usdtToEurRate: 0
    };
  },
  computed: {
    totalEstimateDisplay: function () {
      var code = this.preferredFiat;
      var walletCode = this.fiatWalletCode(code);
      var total = this.walletNumber(walletCode, "available_balance") + this.walletNumber(walletCode, "reserved_balance");
      return code + " " + this.formatAmount(total, 2);
    },
    preferredFiat: function () {
      var code = String((this.userProfile && this.userProfile.preferred_fiat) || "EUR").toUpperCase();
      return ["EUR", "CHF", "USD", "GBP"].indexOf(code) !== -1 ? code : "EUR";
    },
    visibleFiatWallets: function () {
      var self = this;
      var supported = ["EUR", "CHF", "USD", "GBP"];
      return supported
        .map(function (code) {
          var walletCode = self.fiatWalletCode(code);
          var wallet = self.walletMap[walletCode] || {
            wallet_code: walletCode,
            currency_code: code,
            available_balance: "0.00000000",
            reserved_balance: "0.00000000"
          };
          return wallet;
        })
        .filter(function (wallet) {
          var code = String(wallet.currency_code || "").toUpperCase();
          var hasBalance = self.walletNumber(wallet.wallet_code, "available_balance") > 0 || self.walletNumber(wallet.wallet_code, "reserved_balance") > 0;
          return code === self.preferredFiat || hasBalance;
        });
    },
    visibleCryptoWallets: function () {
      var self = this;
      var supported = [
        { wallet_code: "cash_usdt", currency_code: "USDT", decimals: 2, always: true },
        { wallet_code: "spot_usdc", currency_code: "USDC", decimals: 2, always: true },
        { wallet_code: "spot_btc", currency_code: "BTC", decimals: 8 },
        { wallet_code: "spot_eth", currency_code: "ETH", decimals: 6 },
        { wallet_code: "spot_trx", currency_code: "TRX", decimals: 2 }
      ];
      return supported.filter(function (asset) {
        return asset.always || self.walletNumber(asset.wallet_code, "available_balance") > 0 || self.walletNumber(asset.wallet_code, "reserved_balance") > 0;
      }).map(function (asset) {
        var wallet = self.walletMap[asset.wallet_code] || {};
        return Object.assign({}, asset, wallet, { wallet_code: asset.wallet_code, currency_code: asset.currency_code });
      });
    }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) {
        document.body.classList.add(BODY_CLASSES[i]);
      }
      document.body.setAttribute("data-nc2c-page", "wallet");
      document.body.setAttribute("data-nc2c-locked", "true");
    } catch (e) {}
    this.loadSharedScript("/static/previews/shared/marble-bg.js", "eurforexMarbleBgJs");
    this.loadSharedScript("/static/previews/shared/back-nav.js", "eurforexBackNav");
    this.fetchWallets();
  },
  beforeDestroy: function () {
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
    openFiatRechargeModal: function () {
      this.fiatRechargeModalOpen = true;
    },
    closeFiatRechargeModal: function () {
      this.fiatRechargeModalOpen = false;
    },
    openFundRecords: function (event) {
      if (event && event.preventDefault) event.preventDefault();
      if (window.location && window.location.hash === "#/pages/setting/fundRecord") {
        window.location.hash = "#/pages/setting/wallet";
      }
      window.location.hash = "#/pages/setting/fundRecord";
    },
    fetchWallets: function () {
      var self = this;
      this.walletLoading = true;
      this.walletError = "";
      Promise.all([userApi.overview(), userApi.appConfig()])
        .then(function (results) {
          var data = results[0] || {};
          var config = results[1] || {};
          self.userProfile = data.user || {};
          var map = data.wallet_map || {};
          if (!Object.keys(map).length && Array.isArray(data.wallets)) {
            data.wallets.forEach(function (item) {
              map[item.wallet_code] = item;
            });
          }
          self.walletMap = map;
          var finance = config.finance || {};
          var rate = parseFloat(finance.usdt_to_eur_rate || "0");
          self.usdtToEurRate = isNaN(rate) ? 0 : rate;
        })
        .catch(function (error) {
          self.walletError = (error && error.message) || self.localizedText("資產載入失敗", "Failed to load assets");
        })
        .finally(function () {
          self.walletLoading = false;
        });
    },
    walletNumber: function (code, field) {
      var wallet = this.walletMap[code] || {};
      var value = parseFloat(wallet[field] || "0");
      return isNaN(value) ? 0 : value;
    },
    walletAmount: function (code, digits) {
      return this.formatAmount(this.walletNumber(code, "available_balance"), digits == null ? 2 : digits);
    },
    walletReserved: function (code, digits) {
      return this.formatAmount(this.walletNumber(code, "reserved_balance"), digits == null ? 2 : digits);
    },
    fiatWalletCode: function (code) {
      return String(code || "EUR").toLowerCase();
    },
    formatAmount: function (value, digits) {
      return Number(value || 0).toLocaleString("en-GB", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
      });
    }
  }
};
</script>

<style>
@import url("../../static/previews/shared/marble-bg.css");
@import url("../../static/previews/nc2c/css/preview-entry.css");

.wallet-asset-action {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75), 0 8px 18px rgba(46, 100, 134, 0.08);
}

.wallet-asset-action--secondary {
  border: 1px solid rgba(46, 100, 134, 0.34);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(232, 246, 252, 0.96));
  color: #16374d;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.92),
    inset 0 -1px 0 rgba(46, 100, 134, 0.08),
    0 10px 20px rgba(46, 100, 134, 0.12);
}

.wallet-asset-action--secondary:hover {
  border-color: rgba(46, 100, 134, 0.5);
  background: linear-gradient(180deg, #ffffff, #dff4fb);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.95),
    0 12px 24px rgba(46, 100, 134, 0.16);
}

.wallet-asset-action--outline {
  border: 1px solid rgba(46, 100, 134, 0.42);
  background: linear-gradient(180deg, rgba(248, 253, 255, 0.96), rgba(234, 247, 252, 0.92));
  color: #1f5d81;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 8px 18px rgba(46, 100, 134, 0.1);
}

.wallet-asset-action--outline:hover {
  border-color: rgba(46, 100, 134, 0.58);
  background: linear-gradient(180deg, #ffffff, rgba(218, 241, 250, 0.95));
  color: #164a68;
}
</style>
