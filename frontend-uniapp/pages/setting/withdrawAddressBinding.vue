<template>
  <div>
    <header class="fixed top-0 w-full border-b border-primary/10 bg-white/75 backdrop-blur-3xl shadow-[0_12px_32px_rgba(33,79,131,0.08)] flex justify-between items-center px-6 h-14 w-full z-50">
      <a class="flex shrink-0 items-center justify-center rounded-full p-2 text-primary-dim transition-colors hover:bg-primary/10" href="javascript:;" @click="backGo($event, '#/pages/setting/user')" :aria-label="localizedText('返回', 'Back')"><span class="material-symbols-outlined">arrow_back</span></a>
      <div class="font-headline text-lg font-bold text-on-surface">{{ localizedText("提領地址綁定", "Withdrawal address binding") }}</div>
      <div class="w-10 shrink-0" aria-hidden="true"></div>
    </header>

    <main class="mx-auto max-w-3xl px-4 pt-20">
      <section class="glass-panel-high mb-6 rounded-[24px] p-5 md:p-6">
        <h2 class="font-headline text-lg text-on-surface">{{ localizedText("新增提領地址", "Add withdrawal address") }}</h2>
        <p class="mt-1 text-sm text-on-surface-variant">{{ localizedText("選擇資產與鏈別，貼上錢包地址並設定備註名稱。", "Choose asset and network, paste wallet address, and set a note.") }}</p>
        <div class="mt-5 space-y-4">
          <div>
            <div id="field-asset-lbl" class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{{ localizedText("資產", "Asset") }}</div>
            <button
              type="button"
              class="addr-field-trigger mt-1.5 flex w-full items-center justify-between gap-3 rounded-2xl border border-outline-variant/25 bg-white/90 px-4 py-3.5 text-left shadow-[0_1px_0_rgba(255,255,255,0.9)] transition hover:border-primary/28 focus:outline-none focus:ring-2 focus:ring-primary/22"
              aria-haspopup="dialog"
              :aria-expanded="pickerOpen && pickerType === 'asset' ? 'true' : 'false'"
              :aria-controls="'addr-picker-sheet'"
              aria-labelledby="field-asset-lbl"
              @click="openPicker('asset')"
            >
              <span v-if="currentAssetIcon" class="addr-field-trigger__icon"><img :src="currentAssetIcon" alt="" aria-hidden="true" /></span>
              <span class="min-w-0 flex-1">
                <span class="block font-headline text-base font-bold tracking-tight text-on-surface">{{ currentAssetLabel }}</span>
                <span class="mt-0.5 block text-[12px] leading-snug text-on-surface-variant">{{ currentAssetDesc }}</span>
              </span>
              <span class="material-symbols-outlined shrink-0 text-on-surface-variant/90 text-[24px] leading-none" aria-hidden="true">expand_more</span>
            </button>
          </div>
          <div>
            <div id="field-network-lbl" class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">{{ localizedText("網路 / 鏈", "Network") }}</div>
            <button
              type="button"
              class="addr-field-trigger mt-1.5 flex w-full items-center justify-between gap-3 rounded-2xl border border-outline-variant/25 bg-white/90 px-4 py-3.5 text-left shadow-[0_1px_0_rgba(255,255,255,0.9)] transition hover:border-primary/28 focus:outline-none focus:ring-2 focus:ring-primary/22"
              aria-haspopup="dialog"
              :aria-expanded="pickerOpen && pickerType === 'network' ? 'true' : 'false'"
              :aria-controls="'addr-picker-sheet'"
              aria-labelledby="field-network-lbl"
              @click="openPicker('network')"
            >
              <span class="addr-field-trigger__badge">{{ network }}</span>
              <span class="min-w-0 flex-1">
                <span class="block font-headline text-base font-bold tracking-tight text-on-surface">{{ currentNetworkLabel }}</span>
                <span class="mt-0.5 block text-[12px] leading-snug text-on-surface-variant">{{ currentNetworkDesc }}</span>
              </span>
              <span class="material-symbols-outlined shrink-0 text-on-surface-variant/90 text-[24px] leading-none" aria-hidden="true">expand_more</span>
            </button>
          </div>
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant" for="addr-input">{{ localizedText("提領地址", "Withdrawal address") }}</label>
            <textarea id="addr-input" rows="3" v-model="addr" :placeholder="localizedText('貼上完整錢包地址', 'Paste full wallet address')" class="mt-1.5 w-full resize-y rounded-2xl border border-outline-variant/25 bg-white/90 px-4 py-3 font-mono text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"></textarea>
          </div>
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant" for="addr-memo">{{ localizedText("Memo / Tag（若該鏈需要）", "Memo / Tag (if required)") }}</label>
            <input id="addr-memo" type="text" v-model="memo" :placeholder="localizedText('無需則留空', 'Leave empty if not required')" class="mt-1.5 w-full rounded-2xl border border-outline-variant/25 bg-white/90 px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-on-surface-variant" for="addr-label">{{ localizedText("地址備註（選填）", "Address note (optional)") }}</label>
            <input id="addr-label" type="text" v-model="addrLabel" :placeholder="localizedText('例如：硬體錢包、交易所子帳戶', 'e.g. hardware wallet, exchange sub-account')" class="mt-1.5 w-full rounded-2xl border border-outline-variant/25 bg-white/90 px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
          </div>
        </div>
        <button type="button" class="mt-5 w-full rounded-full bg-gradient-to-br from-primary to-primary-dim py-3.5 text-center text-sm font-bold text-white shadow-[0_12px_28px_rgba(47,115,205,0.35)] hover:opacity-95" id="btn-submit-address" :disabled="submitting" @click="submitAddress">{{ submitting ? localizedText('提交中...', 'Submitting...') : localizedText('提交', 'Submit') }}</button>
      </section>

      <section class="glass-panel-high mb-6 rounded-[24px] p-5">
        <div class="flex items-end justify-between gap-3">
        <h2 class="font-headline text-lg text-on-surface">{{ localizedText("已綁定地址", "Bound addresses") }}</h2>
          <button
            v-if="!boundLoading"
            type="button"
            class="shrink-0 text-xs font-bold text-primary-dim underline decoration-primary/40 underline-offset-2 hover:opacity-90"
            @click="loadBoundAddresses"
          >{{ localizedText("重新整理", "Refresh") }}</button>
        </div>
        <LoadingInlineSpinner v-if="boundLoading" :aria-label="localizedText('已綁定地址載入', 'Loading bound addresses')" />
        <div v-else-if="boundError" class="mt-4 rounded-2xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950/90">
          {{ boundError }}
          <button type="button" class="mt-2 text-xs font-bold text-primary-dim underline" @click="loadBoundAddresses">{{ localizedText("重試", "Retry") }}</button>
        </div>
        <div v-else-if="!boundUsdtItems.length" class="mt-4 rounded-2xl border border-outline-variant/15 bg-surface-bright/80 px-4 py-10 text-center text-sm text-on-surface-variant">{{ localizedText("尚無已綁定的 USDT 鏈上地址。提交上方表單並通過審核後會顯示於此。", "No bound USDT withdrawal addresses yet. Submit the form above and it will appear here after approval.") }}</div>
        <div v-else class="mt-4 space-y-3">
          <div
            v-for="it in boundUsdtItems"
            :key="'bound-' + it.id"
            class="rounded-2xl border border-outline-variant/15 bg-surface-bright/80 px-4 py-3.5"
          >
            <div class="flex flex-wrap items-center gap-2">
              <p class="font-semibold text-on-surface">{{ boundRowTitle(it) }}</p>
              <span v-if="it.is_default" class="rounded-md bg-primary-container/80 px-2 py-0.5 text-[10px] font-bold text-primary-dim">{{ localizedText("預設", "Default") }}</span>
              <span
                v-if="it.status && it.status !== 'approved'"
                class="rounded-md border border-amber-300/80 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-900/90"
              >{{ boundStatusLabel(it.status) }}</span>
            </div>
            <p class="mt-2 font-mono text-[13px] leading-relaxed tracking-wide text-on-surface break-all">{{ it.payout_address }}</p>
            <p class="mt-1.5 text-xs font-medium text-on-surface-variant">{{ localizedText("網路：", "Network: ") }}{{ boundRowNetwork(it) }}</p>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部抽層：資產 / 網路選擇 -->
    <div
      v-show="pickerOpen"
      id="addr-picker-overlay"
      class="fixed inset-0 z-[10060] flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="addr-picker-title"
    >
      <div class="addr-picker__backdrop absolute inset-0" @click="closePicker" aria-hidden="true"></div>
      <div
        id="addr-picker-sheet"
        class="addr-picker__sheet relative mx-auto w-full max-w-lg"
        @click.stop
      >
        <div class="addr-picker__grab mx-auto" aria-hidden="true"></div>
        <div class="addr-picker__header">
          <div>
            <h2 id="addr-picker-title" class="font-headline text-lg font-bold text-on-surface">{{ pickerTitle }}</h2>
            <p class="addr-picker__subtitle">{{ pickerSubtitle }}</p>
          </div>
          <button
            type="button"
            class="addr-picker__close"
            :aria-label="localizedText('關閉', 'Close')"
            @click="closePicker"
          >
            <span class="material-symbols-outlined text-[22px] leading-none">close</span>
          </button>
        </div>
        <ul class="addr-picker__list" role="listbox">
          <li v-for="(opt, idx) in activePickerOptions" :key="pickerType + '-' + opt.value">
            <button
              type="button"
              class="addr-picker__opt group"
              :class="{ 'addr-picker__opt--active': isOptionSelected(opt) }"
              role="option"
              :aria-selected="isOptionSelected(opt) ? 'true' : 'false'"
              @click="applyPickerOption(opt)"
            >
              <span v-if="opt.icon" class="addr-picker__coin"><img :src="opt.icon" alt="" aria-hidden="true" /></span>
              <span v-else class="addr-picker__network">{{ opt.value }}</span>
              <span class="min-w-0 flex-1">
                <span class="addr-picker__name">{{ getOptionLabel(opt) }}</span>
                <span v-if="opt.desc" class="addr-picker__desc">{{ getOptionDesc(opt) }}</span>
              </span>
              <span
                v-show="isOptionSelected(opt)"
                class="addr-picker__check material-symbols-outlined"
                aria-hidden="true"
                >check_circle</span>
            </button>
          </li>
        </ul>
        <div class="addr-picker__safe" :style="pickerSafeArea"></div>
      </div>
    </div>
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

/**
 * EURFOREX - 提領地址綁定 (純 H5 Vue2 Options API)
 * 以 docs/previews/nnn/withdraw-address-binding.html 為唯一基準逐字遷移
 * 外部腳本：../shared/marble-bg.js、../shared/back-nav.js（資產／鏈改為底部抽層選擇，不再使用 eurforex-select.js）
 * 地址提交：POST /api/user/payout-methods → 平台審核後生效
 * 已綁定地址：GET /api/user/payout-methods → 完整鏈上地址展示（不截斷）
 */
var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--withdraw-address-binding",
  "font-body",
  "antialiased",
  "min-h-screen",
  "bg-background",
  "text-on-surface",
  "pb-12"
];

export default {
  name: "WithdrawAddressBindingH5",
  data: function () {
    return {
      asset: "USDT",
      network: "TRC20",
      addr: "",
      memo: "",
      addrLabel: "",
      pickerOpen: false,
      pickerType: null,
      assetOptions: [
        { value: "USDT", label: "USDT", desc: "Tether · 與美元掛鉤的穩定幣", descEn: "Tether · USD-linked stablecoin", icon: topupUsdtIcon },
        { value: "USDC", label: "USDC", desc: "USD Coin · 常用的美元穩定幣", descEn: "USD Coin · popular USD stablecoin", icon: topupUsdcIcon },
        { value: "BTC", label: "BTC", desc: "Bitcoin · 比特幣主鏈資產", descEn: "Bitcoin · Bitcoin mainnet asset", icon: topupBtcIcon },
        { value: "ETH", label: "ETH", desc: "Ethereum · 以太幣主鏈資產", descEn: "Ethereum · Ethereum mainnet asset", icon: topupEthIcon },
        { value: "TRX", label: "TRX", desc: "TRON · TRC20 常用網路資產", descEn: "TRON · popular TRC20 network asset", icon: topupTrxIcon }
      ],
      networkOptions: [
        { value: "TRC20", label: "TRC20（Tron）", desc: "手續費低、到帳快，適合 USDT 小額", descEn: "Low fees and fast settlement, suitable for USDT micro transactions", labelEn: "TRC20 (Tron)" },
        { value: "ERC20", label: "ERC20（Ethereum）", desc: "以太坊生態，相容性最廣", descEn: "Ethereum ecosystem, most compatible", labelEn: "ERC20 (Ethereum)" },
        { value: "BEP20", label: "BEP20（BSC）", desc: "幣安智能鏈，速度與費用均衡", descEn: "Binance Smart Chain, balanced speed and fees", labelEn: "BEP20 (BSC)" },
        { value: "BTC", label: "Bitcoin 主網", desc: "BTC 原生鏈轉帳", descEn: "Native BTC mainnet transfer", labelEn: "Bitcoin Mainnet" }
      ],
      payoutItems: [],
      boundLoading: false,
      boundError: "",
      submitting: false
    };
  },
  computed: {
    boundUsdtItems: function () {
      return filterUsdtPayoutItems(this.payoutItems);
    },
    pickerTitle: function () {
      return this.pickerType === "network"
        ? this.localizedText("選擇網路 / 鏈", "Select network")
        : this.localizedText("選擇資產", "Select asset");
    },
    activePickerOptions: function () {
      return this.pickerType === "network" ? this.networkOptions : this.assetOptions;
    },
    pickerSubtitle: function () {
      return this.pickerType === "network"
        ? this.localizedText("請選擇與收款地址一致的網路", "Choose the network matching the receiving address")
        : this.localizedText("選擇平台支援的提領資產", "Choose a supported withdrawal asset");
    },
    pickerSafeArea: function () {
      return { paddingBottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" };
    },
    currentAssetLabel: function () {
      var o = this.findOption(this.assetOptions, this.asset);
      return o ? this.getOptionLabel(o) : this.asset;
    },
    currentAssetDesc: function () {
      var o = this.findOption(this.assetOptions, this.asset);
      return o && o.desc ? this.getOptionDesc(o) : "";
    },
    currentAssetIcon: function () {
      var o = this.findOption(this.assetOptions, this.asset);
      return o && o.icon ? o.icon : "";
    },
    currentNetworkLabel: function () {
      var o = this.findOption(this.networkOptions, this.network);
      return o ? this.getOptionLabel(o) : this.network;
    },
    currentNetworkDesc: function () {
      var o = this.findOption(this.networkOptions, this.network);
      return o && o.desc ? this.getOptionDesc(o) : "";
    }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) {
        document.body.classList.add(BODY_CLASSES[i]);
      }
      document.body.setAttribute("data-nc2c-page", "withdraw-address-binding");
      document.body.setAttribute("data-nc2c-locked", "true");
    } catch (e) {}
    this.loadSharedScript("/static/previews/shared/marble-bg.js", "eurforexMarbleBgJs");
    this.loadSharedScript("/static/previews/shared/back-nav.js", "eurforexBackNav");
    this.loadBoundAddresses();
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
      if (event && event.preventDefault) event.preventDefault();
      if (window.EurforexBack && typeof window.EurforexBack.go === "function") {
        window.EurforexBack.go(fallback);
      } else if (fallback) {
        try {
          if (fallback.charAt(0) === "#") {
            window.location.hash = fallback;
          } else {
            window.location.href = fallback;
          }
        } catch (e) {}
      }
    },
    findOption: function (list, value) {
      for (var i = 0; i < list.length; i++) {
        if (list[i].value === value) return list[i];
      }
      return null;
    },
    getOptionLabel: function (option) {
      return this.localizedText(option.labelZh || option.label || "", option.labelEn || option.label || "");
    },
    getOptionDesc: function (option) {
      return this.localizedText(option.descZh || option.desc || "", option.descEn || option.desc || "");
    },
    openPicker: function (type) {
      this.pickerType = type === "network" ? "network" : "asset";
      this.pickerOpen = true;
      try {
        document.body.style.overflow = "hidden";
      } catch (e) {}
    },
    closePicker: function () {
      this.pickerOpen = false;
      this.pickerType = null;
      try {
        document.body.style.overflow = "";
      } catch (e) {}
    },
    isOptionSelected: function (opt) {
      if (this.pickerType === "network") return this.network === opt.value;
      return this.asset === opt.value;
    },
    applyPickerOption: function (opt) {
      if (this.pickerType === "network") this.network = opt.value;
      else this.asset = opt.value;
      this.closePicker();
    },
    submitAddress: function () {
      if (this.asset !== "USDT") {
        alert(this.$t("phrases.目前後端僅支援 USDT 鏈上提領地址。"));
        return;
      }
      var address = String(this.addr || "").trim();
      if (!address) {
        alert(this.$t("phrases.請填寫提領地址。"));
        return;
      }
      if (this.submitting) return;
      var self = this;
      this.submitting = true;
      userApi
        .createPayoutMethod({
          channel_type: "usdt",
          usdt_network: this.network,
          payout_address: address,
          pix_key: "",
          is_default: false
        })
        .then(function () {
          self.addr = "";
          self.memo = "";
          self.addrLabel = "";
          alert(self.$t("phrases.已提交，待平台審核通過後可用於提領。"));
          return self.loadBoundAddresses();
        })
        .catch(function (error) {
          alert((error && error.message) || self.$t("phrases.地址提交失敗"));
        })
        .finally(function () {
          self.submitting = false;
        });
    },
    boundRowTitle: usdtPayoutRowTitle,
    boundRowNetwork: function (it) {
      return it.usdt_network ? String(it.usdt_network).toUpperCase() : "—";
    },
    boundStatusLabel: function (status) {
      return payoutMethodStatusLabel(status);
    },
    loadBoundAddresses: function () {
      var self = this;
      this.boundLoading = true;
      this.boundError = "";
      return userApi
        .payoutMethods()
        .then(function (data) {
          self.payoutItems = (data && data.items) || [];
        })
        .catch(function (e) {
          self.boundError = (e && e.message) || self.localizedText("載入失敗", "Failed to load");
          self.payoutItems = [];
        })
        .finally(function () {
          self.boundLoading = false;
        });
    }
  }
};
</script>

<style>
@import url("../../static/previews/shared/marble-bg.css");
@import url("../../static/previews/nc2c/css/preview-entry.css");

.addr-field-trigger {
  min-height: 92px;
}

.addr-field-trigger__icon,
.addr-field-trigger__badge {
  align-items: center;
  border-radius: 18px;
  display: inline-flex;
  flex: 0 0 auto;
  height: 48px;
  justify-content: center;
  width: 48px;
}

.addr-field-trigger__icon {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 20px rgba(43, 96, 153, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.addr-field-trigger__icon img {
  display: block;
  height: 34px;
  object-fit: contain;
  width: 34px;
}

.addr-field-trigger__badge {
  background: linear-gradient(180deg, #eef7ff 0%, #dff1ff 100%);
  border: 1px solid rgba(92, 154, 220, 0.22);
  color: #316fc9;
  font-family: var(--font-headline, inherit);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  width: 64px;
}

.addr-picker__backdrop {
  background: rgba(14, 29, 45, 0.42);
  backdrop-filter: blur(7px);
}

.addr-picker__sheet {
  animation: addrPickerSlideUp 0.24s cubic-bezier(.2,.8,.2,1);
  background:
    radial-gradient(circle at 18% 0%, rgba(120, 190, 255, 0.14), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(247, 252, 255, 0.96) 100%);
  border: 1px solid rgba(214, 229, 241, 0.86);
  border-radius: 30px 30px 0 0;
  box-shadow: 0 -22px 56px rgba(18, 50, 82, 0.22);
  max-height: min(72vh, 560px);
  overflow: hidden;
}

.addr-picker__grab {
  background: rgba(126, 151, 176, 0.26);
  border-radius: 999px;
  height: 5px;
  margin-top: 10px;
  width: 48px;
}

.addr-picker__header {
  align-items: flex-start;
  border-bottom: 1px solid rgba(207, 224, 239, 0.52);
  display: flex;
  justify-content: space-between;
  padding: 20px 22px 15px;
}

.addr-picker__subtitle {
  color: #71839a;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.35;
  margin-top: 5px;
}

.addr-picker__close {
  align-items: center;
  background: rgba(241, 247, 252, 0.86);
  border: 1px solid rgba(214, 229, 241, 0.86);
  border-radius: 999px;
  color: #6e8094;
  display: inline-flex;
  flex: 0 0 auto;
  height: 36px;
  justify-content: center;
  transition: background .16s ease, transform .16s ease;
  width: 36px;
}

.addr-picker__close:active {
  transform: scale(.96);
}

.addr-picker__list {
  display: grid;
  gap: 12px;
  max-height: min(52vh, 430px);
  overflow-y: auto;
  padding: 16px 14px 18px;
  scrollbar-width: none;
}

.addr-picker__list::-webkit-scrollbar {
  display: none;
}

.addr-picker__opt {
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(207, 224, 239, 0.82);
  border-radius: 22px;
  box-shadow: 0 12px 26px rgba(41, 91, 148, 0.07), inset 0 1px 0 rgba(255, 255, 255, 0.96);
  display: flex;
  gap: 13px;
  min-height: 82px;
  padding: 13px 15px;
  text-align: left;
  transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease, background .16s ease;
  width: 100%;
}

.addr-picker__opt:active {
  transform: scale(.99);
}

.addr-picker__opt--active {
  background:
    linear-gradient(180deg, rgba(245, 250, 255, 0.98) 0%, rgba(232, 243, 255, 0.96) 100%);
  border-color: rgba(82, 139, 242, 0.68);
  box-shadow: 0 16px 32px rgba(64, 111, 220, 0.15), inset 0 0 0 1px rgba(82, 139, 242, 0.18);
}

.addr-picker__coin,
.addr-picker__network {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  flex: 0 0 auto;
  height: 52px;
  justify-content: center;
  width: 52px;
}

.addr-picker__coin {
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 12px 24px rgba(41, 91, 148, 0.1);
}

.addr-picker__coin img {
  display: block;
  height: 42px;
  object-fit: contain;
  width: 42px;
}

.addr-picker__network {
  background: linear-gradient(180deg, #f4faff 0%, #dfefff 100%);
  border: 1px solid rgba(92, 154, 220, 0.26);
  box-shadow: inset 0 1px 0 rgba(255,255,255,.88), 0 8px 18px rgba(62, 122, 190, 0.08);
  color: #3d75d7;
  font-family: var(--font-headline, inherit);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: -0.02em;
}

.addr-picker__name {
  color: #1b2d43;
  display: block;
  font-family: var(--font-headline, inherit);
  font-size: 16px;
  font-weight: 850;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.addr-picker__desc {
  color: #72849b;
  display: block;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;
  margin-top: 5px;
}

.addr-picker__check {
  align-items: center;
  background: #1c2b40;
  border-radius: 999px;
  color: #fff;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 18px;
  height: 24px;
  justify-content: center;
  width: 24px;
}

.addr-picker__safe {
  border-top: 1px solid rgba(207, 224, 239, 0.42);
  padding: 4px 12px 12px;
}

@keyframes addrPickerSlideUp {
  from {
    opacity: 0.2;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
