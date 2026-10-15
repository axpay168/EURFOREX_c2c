<template>
  <div>
    <header class="fixed top-0 w-full border-b border-primary/10 bg-white/75 backdrop-blur-3xl shadow-[0_12px_32px_rgba(33,79,131,0.08)] flex justify-between items-center px-6 h-14 w-full z-50">
      <a class="flex shrink-0 items-center justify-center rounded-full p-2 text-primary-dim transition-colors hover:bg-primary/10" href="#/pages/setting/user" @click="backGo($event, '#/pages/setting/user')"><span class="material-symbols-outlined">arrow_back</span></a>
      <div class="min-w-0 flex-1 px-1 text-center font-headline text-lg font-bold text-on-surface">{{ localizedText("換匯提領", "FX withdrawal") }}</div>
      <a class="flex shrink-0 min-w-[2.5rem] items-center justify-center rounded-full p-2 text-xs font-bold text-primary-dim transition-colors hover:bg-primary/10" href="#/pages/setting/withdrawUsdt" :title="localizedText('鏈上轉出', 'On-chain crypto withdrawal')">{{ targetAsset }}</a>
    </header>

    <main class="mx-auto max-w-lg px-4 pt-20">

      <div class="mb-3 flex items-start gap-2 rounded-2xl border border-sky-200/80 bg-sky-50/90 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-sky-950/85">
        <span class="material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-sky-700">currency_exchange</span>
        <span>{{ localizedText("使用 EUR 可用餘額依平台匯率換算為 USDT，扣除手續費後提領至您綁定或填寫的 USDT 地址。", "Use your available EUR balance to convert to USDT at the platform rate, then withdraw to your bound or entered USDT address after fees.").split("USDT").join(targetAsset) }} {{ localizedText("USDT 與 USDC 使用相同的平台參考匯率。", "USDT and USDC use the same platform reference rate.") }}</span>
      </div>

      <section class="swap-hero p-5 mb-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h2 class="font-headline text-lg font-bold text-on-surface">{{ localizedText("以 EUR 餘額換算 USDT", "Convert USDT from EUR balance").split("USDT").join(targetAsset) }}</h2>
            <p class="mt-1 text-xs font-medium text-on-surface-variant">{{ localizedText("選擇要收取的穩定幣。", "Select which stablecoin you want to receive.") }}</p>
          </div>
          <div class="stablecoin-toggle" role="group" :aria-label="localizedText('選擇資產', 'Select receiving asset')">
            <button
              v-for="coin in targetAssets"
              :key="coin"
              type="button"
              :class="{ 'stablecoin-toggle__btn--active': targetAsset === coin }"
              class="stablecoin-toggle__btn"
              @click="selectTargetAsset(coin)"
            >{{ coin }}</button>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2 text-center">
          <div class="rounded-2xl bg-white/70 border border-white/80 px-3 py-3">
            <div class="text-[11px] text-on-surface-variant">{{ localizedText("可用 EUR", "Available EUR") }}</div>
            <div class="font-headline text-xl tabular-nums mt-0.5">{{ formatAmount(maxEur, 2) }}</div>
          </div>
          <div class="rounded-2xl bg-white/70 border border-white/80 px-3 py-3">
            <div class="text-[11px] text-on-surface-variant">{{ localizedText("參考匯率", "Reference rate") }}</div>
            <div class="font-headline text-xl tabular-nums mt-0.5">{{ formatAmount(rate, 4) }}</div>
          </div>
        </div>
      </section>

      <section class="swap-card p-[18px]">
        <div class="space-y-5 text-sm">

          <div>
            <label class="mb-2 block font-semibold text-on-surface" for="swap-eur-amt">{{ localizedText("提領金額", "Withdrawal amount in EUR") }}</label>
            <div class="flex min-h-[56px] items-center gap-3 rounded-[18px] border border-outline-variant/35 bg-gradient-to-b from-white to-surface-container-low/90 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <input class="min-w-0 flex-1 border-0 bg-transparent text-base font-bold text-on-surface placeholder:text-on-surface-variant/80 focus:outline-none focus:ring-0" id="swap-eur-amt" inputmode="decimal" autocomplete="off" placeholder="0" type="text" v-model="eurAmount" />
              <span class="shrink-0 text-[13px] font-extrabold uppercase tracking-wider text-on-surface">EUR</span>
              <button class="shrink-0 rounded-xl bg-primary-container/70 px-3 py-1.5 text-xs font-bold text-primary-dim hover:bg-primary-container" id="swap-max-eur" type="button" @click="fillMax">{{ localizedText("全部", "All") }}</button>
            </div>
          </div>

          <div class="rounded-[18px] border border-outline-variant/25 bg-surface-container-low/90 px-4 py-3">
            <h3 class="text-xs font-bold uppercase tracking-[0.12em] text-on-surface-variant">{{ localizedText("換算摘要", "Conversion summary") }}</h3>
            <dl class="mt-3 space-y-2 text-sm">
              <div class="flex justify-between gap-4">
                <dt class="text-on-surface-variant">{{ localizedText("換算 USDT（毛額）", "Converted USDT (gross)").split("USDT").join(targetAsset) }}</dt>
                <dd class="font-semibold tabular-nums" id="swap-gross-usdt">{{ grossDisplay }}</dd>
              </div>
              <div class="flex justify-between gap-4">
                <dt class="text-on-surface-variant">{{ localizedText("手續費", "Fee") }} ({{ targetAsset }})</dt>
                <dd class="font-semibold tabular-nums" id="swap-fee-usdt">{{ feeDisplay }}</dd>
              </div>
              <div class="flex justify-between gap-4 border-t border-outline-variant/20 pt-2">
                <dt class="text-on-surface-variant">{{ localizedText("預計到帳數量", "Estimated arrival") }} {{ targetAsset }}</dt>
                <dd class="font-headline font-bold tabular-nums text-primary-dim" id="swap-net-usdt">{{ netDisplay }}</dd>
              </div>
            </dl>
          </div>

          <div>
            <div class="mb-2 flex items-center justify-between gap-2">
              <span class="font-semibold text-on-surface">{{ targetAsset }} {{ localizedText("收款地址", "receiving address") }}</span>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 rounded-xl py-1.5 pl-1 pr-2 text-sm font-bold text-primary-dim transition-colors hover:bg-primary/8 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                @click="openAddressPicker"
              >
                <span class="material-symbols-outlined text-[22px] leading-none" aria-hidden="true">bookmark</span>
                <span>{{ localizedText("地址簿", "Address book") }}</span>
              </button>
            </div>
            <div class="rounded-[18px] border border-outline-variant/35 bg-gradient-to-b from-white to-surface-container-low/90 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
              <textarea class="min-h-[28px] w-full resize-none rounded-[14px] border-0 bg-transparent px-3 py-1.5 font-mono text-[13px] leading-snug text-on-surface placeholder:text-on-surface-variant/65 focus:outline-none focus:ring-0" id="swap-usdt-addr" rows="1" spellcheck="false" autocomplete="off" :placeholder="addressPlaceholder" v-model="usdtAddr"></textarea>
            </div>
          </div>

          <button type="button" class="swap-submit flex h-[52px] w-full items-center justify-center rounded-full font-headline text-base font-bold tracking-wide" id="swap-submit" :disabled="submitting" @click="submit">{{ submitting ? localizedText('提交中...', 'Submitting...') : localizedText('提交換匯提領', 'Submit FX withdrawal') }}</button>

          <p class="px-1 text-center text-xs leading-relaxed text-on-surface-variant">
            {{ localizedText("匯率與手續費以實際提交時系統顯示之報價為準。", "The exchange rate and fee are based on the quote shown at the time of submission.") }}
          </p>
        </div>
      </section>

      <section class="mt-4 grid grid-cols-2 gap-2.5 text-center text-xs font-semibold sm:text-sm">
        <a class="swap-card py-3.5 hover:opacity-95" href="#/pages/setting/fundRecord">{{ localizedText("提領紀錄", "Withdrawal records") }}</a>
        <a class="swap-card py-3.5 hover:opacity-95" href="#/pages/setting/wallet">{{ localizedText("返回錢包", "Back to wallet") }}</a>
      </section>
    </main>

    <div class="pointer-events-none fixed bottom-0 left-0 z-40 h-24 w-full bg-gradient-to-t from-background to-transparent"></div>

    <!-- Select stablecoin receiving address from address book -->
    <div
      v-show="addrPickerOpen"
      class="fixed inset-0 z-[10060] flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="addr-picker-title"
    >
      <div class="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" @click="closeAddressPicker"></div>
      <div
        class="relative mx-auto flex max-h-[72vh] w-full max-w-lg flex-col rounded-t-3xl border border-outline-variant/20 bg-white shadow-2xl"
        @click.stop
      >
        <div class="flex items-center justify-between border-b border-outline-variant/15 px-4 py-3">
          <h2 id="addr-picker-title" class="font-headline text-base font-bold text-on-surface">{{ localizedText("選擇收款地址", "Select receiving address") }}</h2>
          <button
            type="button"
            class="rounded-full p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low"
            :aria-label="localizedText('關閉', 'Close')"
            @click="closeAddressPicker"
          >
            <span class="material-symbols-outlined text-[22px] leading-none">close</span>
          </button>
        </div>
        <div class="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-2">
          <p v-if="!addressOptions.length" class="py-8 text-center text-sm text-on-surface-variant">{{ localizedText("尚無 USDT 地址，請先新增地址。", "No USDT address yet. Please add an address first.").split("USDT").join(targetAsset) }}</p>
          <button
            v-for="(item, idx) in addressOptions"
            :key="idx"
            type="button"
            class="w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low/90 px-4 py-3.5 text-left transition active:scale-[0.99] hover:border-primary/25"
            @click="selectAddressItem(item)"
          >
            <p class="font-headline text-sm font-semibold text-on-surface">{{ item.label }}</p>
            <p class="mt-1 font-mono text-xs leading-relaxed text-on-surface-variant break-all">{{ item.addr }}</p>
            <p class="mt-0.5 text-[11px] text-on-surface-variant/90">{{ item.network }}</p>
          </button>
        </div>
        <div
          class="border-t border-outline-variant/15 p-3"
          :style="{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }"
        >
          <a
            class="flex h-12 w-full items-center justify-center rounded-2xl border border-primary/30 bg-primary-container/55 font-headline text-sm font-bold text-primary-dim transition hover:bg-primary-container/75"
            href="#/pages/setting/withdrawAddressBinding"
            @click="closeAddressPicker"
            >{{ localizedText("新增地址", "Add address") }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { userApi } from '@/utils/api'
import { formatTruncatedAmount, trimTruncatedNumber } from '@/utils/amountFormat'
import { filterUsdtPayoutItems } from '@/utils/payoutUsdt'

/**
 * EURFOREX - 換匯提領 (純 H5 Vue2 Options API)
 * 以 docs/previews/nnn/eur-swap-withdraw.html 為唯一基準逐字遷移
 */
var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--eur-swap-withdraw",
  "font-body",
  "min-h-screen",
  "bg-background",
  "pb-32",
  "text-on-surface",
  "antialiased"
];

export default {
  name: "EurSwapWithdrawH5",
  data: function () {
    return {
      eurAmount: "",
      usdtAddr: "",
      targetAsset: "USDT",
      targetAssets: ["USDT", "USDC"],
      rate: 0,
      feeMode: "percent",
      feePct: 0,
      feeFixedUsdt: 0,
      maxEur: 0,
      submitting: false,
      addrPickerOpen: false,
      addressOptions: []
    };
  },
  computed: {
    _eur: function () {
      var raw = this.eurAmount ? String(this.eurAmount).replace(/,/g, "").trim() : "";
      var n = parseFloat(raw);
      return isNaN(n) ? 0 : n;
    },
    grossDisplay: function () {
      if (!this._eur || this._eur <= 0 || !this.rate || this.rate <= 0) return "—";
      var gross = this._eur * this.rate;
      return gross.toFixed(8).replace(/\.?0+$/, "") + " " + this.targetAsset;
    },
    feeDisplay: function () {
      if (!this._eur || this._eur <= 0 || !this.rate || this.rate <= 0) return "—";
      var gross = this._eur * this.rate;
      var fee = this.feeMode === "fixed_usdt" ? this.feeFixedUsdt : gross * (this.feePct / 100);
      var suffix = this.feeMode === "fixed_usdt" ? this.localizedText("固定", "Fixed") : this.feePct + "%";
      return fee.toFixed(8).replace(/\.?0+$/, "") + " " + this.targetAsset + " (" + suffix + ")";
    },
    netDisplay: function () {
      if (!this._eur || this._eur <= 0 || !this.rate || this.rate <= 0) return "—";
      var gross = this._eur * this.rate;
      var fee = this.feeMode === "fixed_usdt" ? this.feeFixedUsdt : gross * (this.feePct / 100);
      var net = gross - fee;
      return formatTruncatedAmount(net, 2) + " " + this.targetAsset;
    },
    addressPlaceholder: function () {
      return this.localizedText("TRC20/ERC20 USDT 地址", "TRC20/ERC20 USDT address").split("USDT").join(this.targetAsset);
    }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) {
        document.body.classList.add(BODY_CLASSES[i]);
      }
      document.body.setAttribute("data-nc2c-page", "eur-swap-withdraw");
      document.body.setAttribute("data-nc2c-locked", "true");
    } catch (e) {}
    this.loadSharedScript("/static/previews/shared/marble-bg.js", "eurforexMarbleBgJs");
    this.loadSharedScript("/static/previews/shared/back-nav.js", "eurforexBackNav");
    this.loadPageData();
  },
  beforeDestroy: function () {
    try {
      document.body.style.overflow = "";
    } catch (e) {}
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
    fillMax: function () {
      this.eurAmount = trimTruncatedNumber(this.maxEur, 2);
    },
    formatAmount: function (value, digits) {
      return formatTruncatedAmount(value, digits);
    },
    selectTargetAsset: function (asset) {
      var next = String(asset || "USDT").toUpperCase();
      if (this.targetAssets.indexOf(next) === -1) next = "USDT";
      if (this.targetAsset !== next) {
        this.targetAsset = next;
        this.usdtAddr = "";
        this.loadAddressOptions();
      }
    },
    loadPageData: function () {
      var self = this;
      Promise.all([
        userApi.overview().catch(function () { return {}; }),
        userApi.appConfig().catch(function () { return {}; })
      ])
        .then(function (results) {
          var data = results[0] || {};
          var config = results[1] || {};
          var map = (data && data.wallet_map) || {};
          var eur = map.eur || {};
          self.maxEur = parseFloat(eur.available_balance || "0") || 0;
          var fin = (config && config.finance) || {};
          self.rate = parseFloat(fin.eur_to_usdt_withdraw_rate || "0") || 0;
          self.feeMode = fin.eur_to_usdt_withdraw_fee_mode === "fixed_usdt" ? "fixed_usdt" : "percent";
          self.feePct = parseFloat(fin.eur_to_usdt_withdraw_fee_rate || "0") || 0;
          self.feeFixedUsdt = parseFloat(fin.eur_to_usdt_withdraw_fee_fixed_usdt || "0") || 0;
        })
        .catch(function () {
          self.maxEur = 0;
          self.rate = 0;
        });
      this.loadAddressOptions();
    },
    loadAddressOptions: function () {
      var self = this;
      userApi
        .payoutMethods()
        .then(function (data) {
          var rows = (data && data.items) || [];
          self.addressOptions = filterUsdtPayoutItems(rows, self.targetAsset)
            .filter(function (it) {
              return String(it.status || "") === "approved";
            })
            .map(function (it) {
              return {
                label: (it.is_default ? self.localizedText("預設地址", "Default address") : self.targetAsset + " " + self.localizedText("地址", "address")) + " · " + (it.usdt_network || self.targetAsset),
                addr: it.payout_address,
                network: it.usdt_network || self.targetAsset
              };
            });
        })
        .catch(function () {
          self.addressOptions = [];
        });
    },
    openAddressPicker: function () {
      this.addrPickerOpen = true;
      try {
        document.body.style.overflow = "hidden";
      } catch (e) {}
    },
    closeAddressPicker: function () {
      this.addrPickerOpen = false;
      try {
        document.body.style.overflow = "";
      } catch (e) {}
    },
    selectAddressItem: function (item) {
      if (item && item.addr) {
        this.usdtAddr = item.addr;
      }
      this.closeAddressPicker();
    },
    submit: function () {
      if (!this.eurAmount || !String(this.eurAmount).trim() || this._eur <= 0) {
        alert(this.localizedText("請輸入有效的 EUR 金額。", "Please enter a valid EUR amount."));
        return;
      }
      if (!this.usdtAddr || !String(this.usdtAddr).trim()) {
        alert(this.localizedText("請填寫 USDT 收款地址。", "Please enter a USDT receiving address.").split("USDT").join(this.targetAsset));
        return;
      }
      if (!this.rate || this.rate <= 0) {
        alert(this.localizedText("換匯匯率尚未配置，請稍後再試。", "The FX rate has not been configured yet. Please try again later."));
        return;
      }
      if (this._eur > this.maxEur) {
        alert(this.localizedText("可用 EUR 餘額不足。", "Insufficient available EUR balance."));
        return;
      }
      if (this.submitting) return;
      var self = this;
      this.submitting = true;
      userApi
        .createWithdrawalRequest({
          amount: this._eur.toFixed(8),
          channel_type: "usdt",
          asset_code: "EUR",
          source_wallet_code: "eur",
          payout_address: String(this.usdtAddr || "").trim(),
          remark: "eur_swap_to_" + this.targetAsset.toLowerCase() + "; target_asset=" + this.targetAsset + "; rate=" + this.rate + "; fee_mode=" + this.feeMode + "; fee_pct=" + this.feePct + "; fee_fixed_asset=" + this.feeFixedUsdt
        })
        .then(function (data) {
          window.location.href = "#/pages/setting/withdrawDetail?id=" + (data.withdrawal_request_id || data.request_id || "");
        })
        .catch(function (error) {
          alert((error && error.message) || this.localizedText("換匯提領提交失敗", "Failed to submit FX withdrawal"));
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

.stablecoin-toggle {
  align-items: center;
  background: rgba(255, 255, 255, 0.58);
  border: 1px solid rgba(205, 224, 239, 0.75);
  border-radius: 999px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 8px 20px rgba(38, 91, 151, .06);
  display: inline-flex;
  flex: 0 0 auto;
  gap: 4px;
  padding: 4px;
}

.stablecoin-toggle__btn {
  border-radius: 999px;
  color: #687c94;
  font-size: 12px;
  font-weight: 850;
  line-height: 1;
  min-height: 34px;
  min-width: 58px;
  padding: 0 12px;
  transition: background .16s ease, box-shadow .16s ease, color .16s ease, transform .16s ease;
}

.stablecoin-toggle__btn:active {
  transform: scale(.97);
}

.stablecoin-toggle__btn--active {
  background: linear-gradient(135deg, #6ca9ff, #3269dc);
  box-shadow: 0 8px 18px rgba(51, 106, 220, .24), inset 0 1px 0 rgba(255,255,255,.34);
  color: #fff;
}

@media (max-width: 374px) {
  .stablecoin-toggle {
    width: 100%;
  }

  .stablecoin-toggle__btn {
    flex: 1 1 0;
    min-width: 0;
  }
}
</style>
