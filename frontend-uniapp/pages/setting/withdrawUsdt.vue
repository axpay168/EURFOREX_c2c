<template>
  <div>
    <header class="fixed top-0 w-full border-b border-primary/10 bg-white/75 backdrop-blur-3xl shadow-[0_12px_32px_rgba(33,79,131,0.08)] flex justify-between items-center px-6 h-14 w-full z-50">
      <a class="flex shrink-0 items-center justify-center rounded-full p-2 text-primary-dim transition-colors hover:bg-primary/10" href="#/pages/setting/wallet" @click="backGo($event, '#/pages/setting/wallet')"><span class="material-symbols-outlined">arrow_back</span></a>
      <div class="min-w-0 flex-1 px-1 text-center">
        <div class="font-headline text-lg font-bold leading-tight text-on-surface">{{ selectedAsset.code }} {{ localizedText("提現", "Withdrawal") }}</div>
        <p class="mt-0.5 text-[11px] font-medium text-on-surface-variant">{{ localizedText("鏈上轉出 · 請核對網絡與地址", "On-chain transfer. Please confirm network and address.") }}</p>
      </div>
      <a class="flex shrink-0 min-w-[2.5rem] items-center justify-center rounded-full p-2 text-xs font-bold text-primary-dim transition-colors hover:bg-primary/10" href="#/pages/setting/withdraw" :title="localizedText('改為法幣提現', 'Switch to fiat withdrawal')">EUR</a>
    </header>

    <main class="mx-auto max-w-lg px-4 pt-20">

      <div class="mb-3 flex items-start gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-amber-950/85">
        <span class="material-symbols-outlined mt-0.5 shrink-0 text-[18px] text-amber-700">shield_lock</span>
        <span><span class="font-bold text-amber-900/95">{{ localizedText("鏈上加密貨幣提領：", "On-chain crypto withdrawal:") }}</span>{{ localizedText("選擇幣種後輸入提領金額與目標地址。請僅向可信任地址提現；錯誤網絡或地址可能導致資產無法找回，新地址建議先小額測試。", "Choose an asset, then enter withdrawal amount and destination address. Withdraw only to trusted addresses. Wrong network or address may make funds unrecoverable. For a new address, test with a small amount first.") }}</span>
      </div>

      <section class="usdt-card p-[18px]">
        <div class="space-y-5 text-sm">
          <div>
            <div class="mb-2 font-semibold text-on-surface">{{ localizedText("選擇加密貨幣", "Select crypto asset") }}</div>
            <button type="button" class="crypto-asset-trigger" aria-haspopup="dialog" :aria-expanded="assetPickerOpen ? 'true' : 'false'" @click="openAssetPicker">
              <span class="crypto-asset-trigger__icon"><img :src="selectedAsset.icon" alt="" aria-hidden="true" /></span>
              <span class="crypto-asset-trigger__body">
                <strong>{{ selectedAsset.code }}</strong>
                <small>{{ selectedAsset.name }}</small>
              </span>
              <span class="crypto-asset-trigger__balance">{{ formatAmount(maxBal, selectedAsset.decimals) }}</span>
              <span class="crypto-asset-trigger__chevron" aria-hidden="true">›</span>
            </button>
          </div>

          <div class="withdraw-flow-card withdraw-flow-card--network">
            <div class="withdraw-flow-title">{{ localizedText("提現網絡", "Withdrawal network") }}</div>
            <div class="withdraw-network-pills" role="group" :aria-label="localizedText('鏈上網絡', 'On-chain network')">
              <button type="button" class="usdt-pill" :class="{ 'usdt-pill--active': network === 'TRC20' }" data-network="TRC20" :aria-pressed="network === 'TRC20' ? 'true' : 'false'" @click="network = 'TRC20'">TRC20</button>
              <button type="button" class="usdt-pill" :class="{ 'usdt-pill--active': network === 'ERC20' }" data-network="ERC20" :aria-pressed="network === 'ERC20' ? 'true' : 'false'" @click="network = 'ERC20'">ERC20</button>
              <button type="button" class="usdt-pill" :class="{ 'usdt-pill--active': network === 'BEP20' }" data-network="BEP20" :aria-pressed="network === 'BEP20' ? 'true' : 'false'" @click="network = 'BEP20'">BEP20</button>
            </div>
          </div>

          <div class="withdraw-flow-card withdraw-flow-card--address">
            <div class="withdraw-address-head">
              <div class="withdraw-flow-title">{{ localizedText("提現地址", "Withdrawal address") }}</div>
              <button type="button" class="withdraw-address-book-top" @click="openAddressBook">
                <span class="material-symbols-outlined">bookmark</span>
                {{ localizedText("地址簿", "Address book") }}
              </button>
            </div>
            <div class="withdraw-address-field">
              <textarea id="usdt-address" :key="'withdraw-address-' + network" rows="2" spellcheck="false" autocomplete="off" :placeholder="addressPlaceholder" v-model="address" ref="addrInput"></textarea>
              <button type="button" class="withdraw-address-paste" @click="pasteAddress">
                <span class="material-symbols-outlined">content_paste</span>
                {{ localizedText("黏貼", "Paste") }}
              </button>
            </div>
          </div>

          <div class="withdraw-flow-card withdraw-flow-card--amount">
            <label class="withdraw-flow-title" for="usdt-wd-amount">{{ localizedText("提現數量", "Amount") }}</label>
            <div class="withdraw-amount-field">
              <input id="usdt-wd-amount" inputmode="decimal" autocomplete="off" placeholder="0" type="text" v-model="amount" />
              <button id="usdt-max" type="button" @click="fillMax">{{ localizedText("全部", "ALL") }}</button>
            </div>
            <p>{{ localizedText("可用餘額", "Available balance") }}: <strong>{{ formatAmount(maxBal, selectedAsset.decimals) }} {{ selectedAsset.code }}</strong></p>
          </div>

          <p class="withdraw-min-note">
            <span class="material-symbols-outlined">info</span>
            {{ localizedText("最低提現", "Minimum withdrawal") }} {{ minimumAmountDisplay }}. {{ localizedText("請確認地址與網絡。", "Please verify the address and network.") }}
          </p>

          <div class="withdraw-fee-card">
            <dl>
              <div>
                <dt><span class="material-symbols-outlined">local_offer</span>{{ localizedText("手續費", "Fee") }}</dt>
                <dd>{{ feeDisplay }}</dd>
              </div>
              <div>
                <dt><span class="material-symbols-outlined">account_balance_wallet</span>{{ localizedText("到帳數量", "You receive") }}</dt>
                <dd id="usdt-receive">{{ recvDisplay }}</dd>
              </div>
            </dl>
          </div>

          <button type="button" class="usdt-confirm withdraw-confirm-btn flex h-[52px] w-full items-center justify-center rounded-full font-headline text-base font-bold tracking-wide" data-href="#/pages/setting/withdrawDetail" :disabled="submitting" @click="handleConfirm">{{ submitting ? localizedText("提交中...", "Submitting...") : localizedText("確認提現", "Withdraw") }}</button>

          <p class="px-1 text-center text-xs leading-relaxed text-on-surface-variant">
            {{ localizedText("提現將從平台熱錢包發出，鏈上確認時間視網絡擁堵而定。大額可能觸發人工審核。", "Withdrawal is sent from the platform hot wallet. On-chain confirmation time depends on network traffic. Large requests may trigger manual review.") }}
          </p>
        </div>
      </section>

      <section class="mt-4 grid grid-cols-2 gap-2.5 text-center text-xs font-semibold sm:gap-3 sm:text-sm">
    <a class="usdt-card py-3.5 hover:opacity-95" href="#/pages/setting/fundRecord">{{ localizedText("紀錄", "History") }}</a>
    <a class="usdt-card py-3.5 hover:opacity-95" href="#/pages/setting/mixrecharge">{{ localizedText("充值", "Top up") }}</a>
  </section>
    </main>

    <div class="pointer-events-none fixed bottom-0 left-0 z-40 h-24 w-full bg-gradient-to-t from-background to-transparent"></div>

    <div v-show="assetPickerOpen" class="crypto-picker" role="dialog" aria-modal="true" aria-labelledby="crypto-picker-title">
      <div class="crypto-picker__backdrop" @click="closeAssetPicker"></div>
      <section class="crypto-picker__sheet" @click.stop>
        <div class="crypto-picker__grab" aria-hidden="true"></div>
        <div class="crypto-picker__header">
          <div>
            <h2 id="crypto-picker-title">{{ localizedText("選擇提現幣種", "Select withdraw asset") }}</h2>
            <p>{{ localizedText("選擇要鏈上提領的資產", "Choose the asset to withdraw on-chain") }}</p>
          </div>
          <button type="button" class="crypto-picker__close" :aria-label="localizedText('關閉', 'Close')" @click="closeAssetPicker">×</button>
        </div>
        <div class="crypto-picker__list">
          <button
            v-for="asset in cryptoAssets"
            :key="'asset-picker-' + asset.code"
            type="button"
            class="crypto-picker__item"
            :class="{ 'crypto-picker__item--active': assetCode === asset.code }"
            @click="selectAssetFromPicker(asset.code)"
          >
            <span class="crypto-picker__coin"><img :src="asset.icon" alt="" aria-hidden="true" /></span>
            <span class="crypto-picker__text">
              <strong>{{ asset.code }}</strong>
              <small>{{ asset.name }}</small>
            </span>
            <span class="crypto-picker__amount">{{ assetBalanceDisplay(asset) }}</span>
            <span v-if="assetCode === asset.code" class="crypto-picker__check material-symbols-outlined" aria-hidden="true">check_circle</span>
          </button>
        </div>
        <div class="crypto-picker__safe"></div>
      </section>
    </div>

    <!-- 地址簿（與法幣選銀行共用 Nc2cCenterSheet 外殼） -->
    <Nc2cCenterSheet :visible.sync="addrBookOpen" :title="localizedText('選擇提領地址', 'Select withdrawal address')" title-id="usdt-addr-book-title">
      <p class="mt-2 text-sm leading-relaxed text-slate-600">{{ localizedText("僅展示已保存的 USDT 鏈上地址；審核通過的地址可一鍵帶入。請確認與當前所選網絡一致。", "Only approved USDT on-chain addresses are shown. Approved addresses can be applied to this form with one tap. Please make sure the network matches the selected one.") }}</p>
      <a
        href="#/pages/setting/withdrawAddressBinding"
        class="mt-3 flex w-full items-center justify-center rounded-2xl border-2 border-primary/30 bg-primary/5 py-3 text-sm font-bold text-primary-dim shadow-sm transition-colors hover:bg-primary/10"
        @click="closeAddressBook"
      >新增地址</a>
      <LoadingInlineSpinner v-if="addrBookLoading" :aria-label="localizedText('地址簿載入', 'Loading address book')" />
      <div v-else-if="addrBookError" class="mt-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950/90">
        {{ addrBookError }}
        <button type="button" class="mt-2 text-xs font-bold text-primary-dim underline" @click="loadPayoutMethodsForBook">{{ localizedText("重試", "Retry") }}</button>
      </div>
      <div v-else id="usdt-addr-book-list" class="mt-4 max-h-[min(52vh,360px)] space-y-2 overflow-y-auto">
        <p v-if="!payoutUsdtItems.length" class="py-8 text-center text-sm text-on-surface-variant">{{ localizedText("尚無 USDT 提領地址，請先新增並完成審核。", "No approved USDT withdrawal address found. Please add one and pass verification first.") }}</p>
        <template v-else>
          <button
            v-for="it in payoutUsdtItems"
            :key="'pm-' + it.id"
            type="button"
            class="bank-pick w-full rounded-2xl p-4 text-left transition-colors"
            :class="addrBookRowClass(it)"
            :disabled="it.status !== 'approved'"
            @click="pickPayoutRow(it)"
          >
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-headline text-base font-bold text-slate-900">{{ payoutRowTitle(it) }}</span>
                <span v-if="it.is_default" class="rounded-md border border-primary/35 bg-white px-2 py-0.5 text-[10px] font-bold text-primary-dim shadow-sm">{{ localizedText("預設", "Default") }}</span>
                <span
                  v-if="it.status !== 'approved'"
                  class="rounded-md border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-900/90"
                >{{ payoutStatusLabel(it.status) }}</span>
              </div>
              <p class="mt-2 font-mono text-[13px] leading-snug tracking-wide text-slate-800 break-all">{{ it.payout_address }}</p>
            </div>
          </button>
        </template>
      </div>
      <div class="mt-5 flex gap-3">
        <button
          type="button"
          class="flex-1 rounded-full border-2 border-slate-300 bg-white py-3 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
          @click="closeAddressBook"
        >{{ localizedText("取消", "Cancel") }}</button>
        <button type="button" class="bank-picker-confirm-btn flex-1 rounded-full py-3 text-sm font-bold text-white shadow-[0_10px_22px_rgba(47,115,205,0.35)]" @click="confirmAddressBook">{{ localizedText("確定", "Confirm") }}</button>
      </div>
    </Nc2cCenterSheet>
  </div>
</template>

<script>
import { userApi } from '@/utils/api'
import { filterUsdtPayoutItems, usdtPayoutRowTitle, payoutMethodStatusLabel } from '@/utils/payoutUsdt'
import topupUsdtIcon from '@/static/icons/topup/usdt.svg'
import topupUsdcIcon from '@/static/icons/topup/usdc.svg'
import topupBtcIcon from '@/static/icons/topup/btc.svg'
import topupEthIcon from '@/static/icons/topup/eth.svg'
import topupTrxIcon from '@/static/icons/topup/trx.svg'

/*
 *  */
var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--withdraw-usdt",
  "font-body",
  "min-h-screen",
  "bg-background",
  "pb-32",
  "text-on-surface",
  "antialiased"
];

export default {
  name: "WithdrawUsdtH5",
  data: function () {
    return {
      network: "TRC20",
      assetCode: "USDT",
      cryptoAssets: [
        { code: "USDT", name: "Tether USD", icon: topupUsdtIcon, wallet: "cash_usdt", decimals: 2, min: 10 },
        { code: "USDC", name: "USD Coin", icon: topupUsdcIcon, wallet: "spot_usdc", decimals: 2, min: 10 },
        { code: "BTC", name: "Bitcoin", icon: topupBtcIcon, wallet: "spot_btc", decimals: 8, min: 0.0001 },
        { code: "ETH", name: "Ethereum", icon: topupEthIcon, wallet: "spot_eth", decimals: 6, min: 0.005 },
        { code: "TRX", name: "TRON", icon: topupTrxIcon, wallet: "spot_trx", decimals: 2, min: 20 }
      ],
      walletMap: {},
      address: "",
      amount: "",
      maxBal: 0,
      submitting: false,
      addrBookOpen: false,
      addrBookLoading: false,
      addrBookError: "",
      payoutItems: [],
      pendingPayoutId: null,
      assetPickerOpen: false
    };
  },
  computed: {
    selectedAsset: function () {
      for (var i = 0; i < this.cryptoAssets.length; i++) {
        if (this.cryptoAssets[i].code === this.assetCode) return this.cryptoAssets[i];
      }
      return this.cryptoAssets[0];
    },
    fee: function () {
      var feeMap = {
        USDT: { TRC20: 1, ERC20: 5, BEP20: 0.8 },
        USDC: { TRC20: 1, ERC20: 5, BEP20: 0.8 },
        BTC: { TRC20: 0.0001, ERC20: 0.0001, BEP20: 0.0001 },
        ETH: { TRC20: 0.003, ERC20: 0.003, BEP20: 0.003 },
        TRX: { TRC20: 1, ERC20: 1, BEP20: 1 }
      };
      var m = feeMap[this.selectedAsset.code] || feeMap.USDT;
      return m[this.network] != null ? m[this.network] : 1;
    },
    feeDisplay: function () {
      return this.formatAmount(this.fee, this.selectedAsset.decimals) + " " + this.selectedAsset.code;
    },
    minimumAmountDisplay: function () {
      return this.formatAmount(this.selectedAsset.min, this.selectedAsset.decimals) + " " + this.selectedAsset.code;
    },
    addressPlaceholder: function () {
      if (this.network === "TRC20") return this.localizedText("貼上 TRC20 收款地址（以 T 開頭）", "Paste your TRC20 receiving address (starts with T)");
      if (this.network === "ERC20") return this.localizedText("貼上 ERC20 收款地址（以 0x 開頭，Ethereum 主網）", "Paste your ERC20 receiving address (starts with 0x on Ethereum)");
      return this.localizedText("貼上 BEP20 收款地址（以 0x 開頭，BSC）", "Paste your BEP20 receiving address (starts with 0x on BSC)");
    },
    recvDisplay: function () {
      var raw = this.amount ? String(this.amount).replace(/,/g, "").trim() : "";
      if (!raw) return "—";
      var n = parseFloat(raw);
      if (isNaN(n)) n = 0;
      var net = n - this.fee;
      return this.formatAmount(net > 0 ? net : 0, this.selectedAsset.decimals) + " " + this.selectedAsset.code;
    },
    payoutUsdtItems: function () {
      return filterUsdtPayoutItems(this.payoutItems);
    }
  },
  watch: {
    network: function () {
      this.address = "";
    },
    addrBookOpen: function (open) {
      if (!open) this.pendingPayoutId = null;
    }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) {
        document.body.classList.add(BODY_CLASSES[i]);
      }
      document.body.setAttribute("data-nc2c-page", "withdraw-usdt");
      document.body.setAttribute("data-nc2c-locked", "true");
    } catch (e) {}
    this.loadSharedScript("/static/previews/shared/marble-bg.js", "eurforexMarbleBgJs");
    this.loadSharedScript("/static/previews/shared/back-nav.js", "eurforexBackNav");
    this.loadOverviewBalance();
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
    payoutRowTitle: usdtPayoutRowTitle,
    payoutStatusLabel: function (status) {
      return payoutMethodStatusLabel(status, "不可用");
    },
    formatAmount: function (value, digits) {
      return Number(value || 0).toLocaleString("en-GB", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits
      });
    },
    selectAsset: function (code) {
      this.assetCode = String(code || "USDT").toUpperCase();
      this.amount = "";
      this.address = "";
      this.applyAssetBalance();
    },
    selectAssetFromPicker: function (code) {
      this.selectAsset(code);
      this.closeAssetPicker();
    },
    openAssetPicker: function () {
      this.assetPickerOpen = true;
      try { document.body.style.overflow = "hidden"; } catch (e) {}
    },
    closeAssetPicker: function () {
      this.assetPickerOpen = false;
      try { document.body.style.overflow = ""; } catch (e) {}
    },
    assetBalanceDisplay: function (asset) {
      var wallet = this.walletMap[asset.wallet] || {};
      return this.formatAmount(parseFloat(wallet.available_balance || "0") || 0, asset.decimals);
    },
    applyAssetBalance: function () {
      var wallet = this.walletMap[this.selectedAsset.wallet] || {};
      this.maxBal = parseFloat(wallet.available_balance || "0") || 0;
    },
    loadOverviewBalance: function () {
      var self = this;
      userApi
        .overview()
        .then(function (data) {
          var map = (data && data.wallet_map) || {};
          self.walletMap = map;
          self.applyAssetBalance();
        })
        .catch(function () {
          self.maxBal = 0;
        });
    },
    addrBookRowClass: function (it) {
      if (it.status !== "approved") {
        return "border border-slate-200/90 bg-slate-50/90 cursor-not-allowed opacity-80";
      }
      var sel = this.pendingPayoutId != null && Number(this.pendingPayoutId) === Number(it.id);
      return sel
        ? "bank-pick--selected border-2 border-primary bg-sky-50 ring-2 ring-primary/25 shadow-sm"
        : "border border-slate-300/90 bg-white hover:bg-slate-50";
    },
    pickPayoutRow: function (it) {
      if (!it || it.status !== "approved") return;
      this.pendingPayoutId = it.id;
    },
    preselectPayoutInBook: function () {
      var net = String(this.network || "").toUpperCase();
      var firstApproved = null;
      var matchNet = null;
      var rows = this.payoutUsdtItems;
      for (var i = 0; i < rows.length; i++) {
        var it = rows[i];
        if (it.status !== "approved") continue;
        if (firstApproved == null) firstApproved = it.id;
        if (String(it.usdt_network || "").toUpperCase() === net) {
          matchNet = it.id;
          break;
        }
      }
      this.pendingPayoutId = matchNet != null ? matchNet : firstApproved;
    },
    loadPayoutMethodsForBook: function () {
      var self = this;
      this.addrBookError = "";
      this.addrBookLoading = true;
      return userApi
        .payoutMethods()
        .then(function (data) {
          self.payoutItems = (data && data.items) || [];
          self.preselectPayoutInBook();
        })
        .catch(function (e) {
          self.addrBookError = (e && e.message) || self.localizedText("載入失敗", "Load failed");
          self.payoutItems = [];
        })
        .finally(function () {
          self.addrBookLoading = false;
        });
    },
    openAddressBook: function () {
      this.addrBookOpen = true;
      this.loadPayoutMethodsForBook();
    },
    closeAddressBook: function () {
      this.addrBookOpen = false;
    },
    confirmAddressBook: function () {
      if (this.addrBookLoading) return;
      var id = this.pendingPayoutId;
      if (id == null) {
        alert(this.$t("phrases.請選擇一筆地址。"));
        return;
      }
      var it = null;
      var rows = this.payoutUsdtItems;
      for (var i = 0; i < rows.length; i++) {
        if (Number(rows[i].id) === Number(id)) {
          it = rows[i];
          break;
        }
      }
      if (!it || it.status !== "approved") {
        alert(this.$t("phrases.請選擇已審核通過的地址。"));
        return;
      }
      this.address = String(it.payout_address || "").trim();
      var u = String(it.usdt_network || "").toUpperCase();
      if (u === "TRC20" || u === "ERC20" || u === "BEP20") {
        this.network = u;
      }
      this.closeAddressBook();
    },
    fillMax: function () {
      this.amount = this.maxBal.toFixed(2);
    },
    pasteAddress: function () {
      var self = this;
      try {
        if (!navigator.clipboard || !navigator.clipboard.readText) throw new Error("no-clipboard");
        navigator.clipboard.readText().then(function (txt) {
          if (!txt) {
            alert(self.$t("phrases.剪貼簿暫無內容。"));
            return;
          }
          self.address = String(txt).trim();
        }).catch(function () {
          if (self.$refs.addrInput && self.$refs.addrInput.focus) self.$refs.addrInput.focus();
          alert(self.$t("phrases.請長按輸入框後貼上地址。"));
        });
      } catch (e) {
        if (this.$refs.addrInput && this.$refs.addrInput.focus) this.$refs.addrInput.focus();
        alert(this.$t("phrases.請長按輸入框後貼上地址。"));
      }
    },
    handleConfirm: function (e) {
      if (!this.address || !String(this.address).trim()) {
        alert(this.$t("phrases.請填寫提現地址。"));
        return;
      }
      var n = parseFloat(String(this.amount || "").replace(/,/g, "").trim());
      if (isNaN(n) || n < this.selectedAsset.min) {
        alert(this.localizedText("提現數量需至少 ", "Minimum withdrawal amount is ") + this.minimumAmountDisplay);
        return;
      }
      if (n > this.maxBal) {
        alert(this.$t("phrases.可用餘額不足。"));
        return;
      }
      if (this.submitting) return;
      var self = this;
      this.submitting = true;
      userApi
        .createWithdrawalRequest({
          amount: n.toFixed(8),
          channel_type: "usdt",
          asset_code: this.selectedAsset.code,
          source_wallet_code: this.selectedAsset.wallet,
          payout_address: String(this.address || "").trim(),
          remark: "network:" + this.network
        })
        .then(function (data) {
          window.location.href = "#/pages/setting/withdrawDetail?id=" + (data.withdrawal_request_id || data.request_id || "");
        })
        .catch(function (error) {
          alert((error && error.message) || self.localizedText("提現申請提交失敗", "Withdrawal request submission failed"));
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
.bank-picker-confirm-btn {
  background: linear-gradient(135deg, #3b9ae8, #1e5cad) !important;
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.55) !important;
  text-shadow: 0 1px 2px rgba(0, 36, 76, 0.25);
}
.bank-picker-confirm-btn:hover {
  filter: brightness(1.05);
}
</style>

<style scoped>
.crypto-asset-trigger {
  align-items: center;
  background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(248,252,255,.88));
  border: 1px solid rgba(205, 224, 239, .78);
  border-radius: 22px;
  box-shadow: 0 12px 26px rgba(31, 84, 135, .07), inset 0 1px 0 rgba(255,255,255,.95);
  display: flex;
  gap: 13px;
  min-height: 78px;
  padding: 13px 14px;
  text-align: left;
  transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease;
  width: 100%;
}

.crypto-asset-trigger:active {
  transform: scale(.99);
}

.crypto-asset-trigger__icon,
.crypto-picker__coin {
  align-items: center;
  background: #fff;
  border-radius: 999px;
  box-shadow: 0 10px 22px rgba(41, 91, 148, .1);
  display: inline-flex;
  flex: 0 0 auto;
  height: 50px;
  justify-content: center;
  width: 50px;
}

.crypto-asset-trigger__icon img,
.crypto-picker__coin img {
  display: block;
  height: 40px;
  width: 40px;
}

.crypto-asset-trigger__body {
  display: grid;
  flex: 1 1 auto;
  gap: 3px;
  min-width: 0;
}

.crypto-asset-trigger__body strong,
.crypto-picker__text strong {
  color: #1b2d43;
  font-family: var(--font-headline, inherit);
  font-size: 19px;
  font-weight: 900;
  letter-spacing: -.02em;
  line-height: 1.1;
}

.crypto-asset-trigger__body small,
.crypto-picker__text small {
  color: #72849b;
  font-size: 13px;
  line-height: 1.25;
}

.crypto-asset-trigger__balance,
.crypto-picker__amount {
  color: #7a8ba0;
  flex: 0 0 auto;
  font-size: 13px;
  font-weight: 650;
  text-align: right;
}

.crypto-asset-trigger__chevron {
  color: #1c2b40;
  flex: 0 0 auto;
  font-size: 28px;
  line-height: 1;
}

.crypto-picker {
  align-items: flex-end;
  display: flex;
  inset: 0;
  justify-content: center;
  position: fixed;
  z-index: 12000;
}

.crypto-picker__backdrop {
  background: rgba(14, 29, 45, .42);
  backdrop-filter: blur(7px);
  inset: 0;
  position: absolute;
}

.crypto-picker__sheet {
  animation: cryptoPickerSlideUp .24s cubic-bezier(.2,.8,.2,1);
  background: linear-gradient(180deg, rgba(255,255,255,.98), rgba(247,252,255,.96));
  border: 1px solid rgba(214,229,241,.86);
  border-radius: 30px 30px 0 0;
  box-shadow: 0 -22px 56px rgba(18,50,82,.22);
  max-height: min(76vh, 620px);
  overflow: hidden;
  position: relative;
  width: min(100%, 32rem);
}

.crypto-picker__grab {
  background: rgba(126,151,176,.26);
  border-radius: 999px;
  height: 5px;
  margin: 10px auto 0;
  width: 48px;
}

.crypto-picker__header {
  align-items: flex-start;
  border-bottom: 1px solid rgba(207,224,239,.52);
  display: flex;
  justify-content: space-between;
  padding: 20px 22px 15px;
}

.crypto-picker__header h2 {
  color: #17263d;
  font-family: var(--font-headline, inherit);
  font-size: 19px;
  font-weight: 900;
}

.crypto-picker__header p {
  color: #71839a;
  font-size: 12px;
  font-weight: 600;
  margin-top: 5px;
}

.crypto-picker__close {
  align-items: center;
  background: rgba(241,247,252,.9);
  border: 1px solid rgba(214,229,241,.86);
  border-radius: 999px;
  color: #6e8094;
  display: inline-flex;
  font-size: 26px;
  height: 36px;
  justify-content: center;
  line-height: 1;
  width: 36px;
}

.crypto-picker__list {
  display: grid;
  gap: 12px;
  max-height: min(52vh, 430px);
  overflow-y: auto;
  padding: 16px 14px 18px;
}

.crypto-picker__item {
  align-items: center;
  background: rgba(255,255,255,.9);
  border: 1px solid rgba(207,224,239,.82);
  border-radius: 22px;
  box-shadow: 0 12px 26px rgba(41,91,148,.07), inset 0 1px 0 rgba(255,255,255,.96);
  display: flex;
  gap: 13px;
  min-height: 82px;
  padding: 13px 15px;
  text-align: left;
  transition: transform .16s ease, border-color .16s ease, box-shadow .16s ease, background .16s ease;
  width: 100%;
}

.crypto-picker__item:active {
  transform: scale(.99);
}

.crypto-picker__item--active {
  background: linear-gradient(180deg, rgba(245,250,255,.98), rgba(232,243,255,.96));
  border-color: rgba(82,139,242,.68);
  box-shadow: 0 16px 32px rgba(64,111,220,.15), inset 0 0 0 1px rgba(82,139,242,.18);
}

.crypto-picker__text {
  display: grid;
  flex: 1 1 auto;
  gap: 5px;
  min-width: 0;
}

.crypto-picker__check {
  color: #3269dc;
  flex: 0 0 auto;
  font-size: 22px;
}

.crypto-picker__safe {
  height: max(12px, env(safe-area-inset-bottom, 0px));
}

.withdraw-flow-card {
  background: rgba(255, 255, 255, .88);
  border: 1px solid rgba(210, 226, 239, .78);
  border-radius: 22px;
  box-shadow: 0 14px 30px rgba(31, 84, 135, .07), inset 0 1px 0 rgba(255, 255, 255, .94);
  padding: 16px;
}

.withdraw-flow-title {
  color: #65778e;
  display: block;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 14px;
}

.withdraw-address-head {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  margin-bottom: 14px;
}

.withdraw-address-head .withdraw-flow-title {
  margin-bottom: 0;
}

.withdraw-address-book-top {
  align-items: center;
  background: rgba(255, 255, 255, .82);
  border: 1px solid rgba(210, 226, 239, .78);
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(31, 84, 135, .06);
  color: #3c6fd4;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 850;
  gap: 4px;
  min-height: 32px;
  padding: 0 11px;
}

.withdraw-address-book-top .material-symbols-outlined {
  font-size: 15px;
}

.withdraw-network-pills {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.withdraw-flow-card--network .usdt-pill {
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(31, 84, 135, .06);
  min-height: 48px;
  width: 100%;
}

.withdraw-address-field {
  align-items: stretch;
  background: rgba(255, 255, 255, .9);
  border: 1px solid rgba(210, 226, 239, .82);
  border-radius: 20px;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.92);
  display: flex;
  gap: 10px;
  min-height: 88px;
  padding: 12px 12px 12px 16px;
}

.withdraw-address-field textarea {
  background: transparent;
  border: 0;
  color: #192b41;
  flex: 1 1 auto;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.55;
  min-height: 62px;
  outline: 0;
  overflow-wrap: anywhere;
  padding: 2px 0;
  resize: none;
  word-break: break-all;
}

.withdraw-address-field textarea::placeholder {
  color: rgba(105, 124, 145, .58);
  font-size: 14px;
  font-weight: 500;
}

.withdraw-address-paste {
  align-items: center;
  align-self: center;
  background: linear-gradient(180deg, rgba(255,255,255,.96), rgba(244,249,255,.9));
  border: 1px solid rgba(200,220,238,.86);
  border-radius: 14px;
  box-shadow: 0 8px 16px rgba(31, 84, 135, .07);
  color: #3c6fd4;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 850;
  gap: 4px;
  min-height: 34px;
  padding: 0 12px;
}

.withdraw-address-paste .material-symbols-outlined {
  font-size: 15px;
}

.withdraw-amount-field {
  align-items: center;
  background: rgba(255, 255, 255, .92);
  border: 1px solid rgba(210, 226, 239, .82);
  border-radius: 18px;
  box-shadow: 0 10px 22px rgba(31,84,135,.05), inset 0 1px 0 rgba(255,255,255,.94);
  display: flex;
  min-height: 64px;
  padding: 0 12px 0 18px;
}

.withdraw-amount-field input {
  background: transparent;
  border: 0;
  color: #071633;
  flex: 1 1 auto;
  font-family: var(--font-headline, inherit);
  font-size: 32px;
  font-weight: 850;
  letter-spacing: -.035em;
  min-width: 0;
  outline: 0;
}

.withdraw-amount-field input::placeholder {
  color: rgba(22,41,63,.48);
}

.withdraw-amount-field button {
  background: linear-gradient(135deg, #70a8ff, #3266dd);
  border-radius: 999px;
  box-shadow: 0 8px 18px rgba(50,102,221,.23);
  color: #fff;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 900;
  min-height: 36px;
  padding: 0 16px;
}

.withdraw-flow-card--amount p {
  color: #75879d;
  font-size: 12px;
  margin-top: 10px;
}

.withdraw-flow-card--amount strong {
  color: #416bff;
  font-weight: 800;
}

.withdraw-min-note {
  align-items: flex-start;
  color: #65778e;
  display: flex;
  font-size: 12px;
  gap: 7px;
  line-height: 1.45;
  padding: 0 2px;
}

.withdraw-min-note .material-symbols-outlined {
  color: #6b7d94;
  flex: 0 0 auto;
  font-size: 17px;
}

.withdraw-fee-card {
  background: rgba(255, 255, 255, .88);
  border: 1px solid rgba(210, 226, 239, .78);
  border-radius: 22px;
  box-shadow: 0 14px 30px rgba(31, 84, 135, .07), inset 0 1px 0 rgba(255, 255, 255, .94);
  padding: 14px 16px;
}

.withdraw-fee-card dl {
  display: grid;
  gap: 0;
}

.withdraw-fee-card dl > div {
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 42px;
}

.withdraw-fee-card dl > div + div {
  border-top: 1px solid rgba(210, 226, 239, .7);
}

.withdraw-fee-card dt {
  align-items: center;
  color: #697c93;
  display: inline-flex;
  font-size: 13px;
  gap: 10px;
}

.withdraw-fee-card dt .material-symbols-outlined {
  align-items: center;
  background: #eef4ff;
  border-radius: 10px;
  color: #4c78df;
  display: inline-flex;
  font-size: 18px;
  height: 28px;
  justify-content: center;
  width: 28px;
}

.withdraw-fee-card dd {
  color: #13253b;
  font-size: 14px;
  font-weight: 850;
  text-align: right;
}

.withdraw-confirm-btn {
  margin-top: -2px;
}

@keyframes cryptoPickerSlideUp {
  from { opacity: .35; transform: translateY(22px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
