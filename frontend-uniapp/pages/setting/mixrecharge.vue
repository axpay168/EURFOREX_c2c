<template>
  <div>
    <header class="fixed top-0 w-full border-b border-primary/10 bg-white/75 backdrop-blur-3xl shadow-[0_12px_32px_rgba(33,79,131,0.08)] flex justify-between items-center px-6 h-14 w-full z-50">
      <button v-if="selectedCrypto" type="button" class="topup-header-action" :aria-label="localizedText('返回選擇資產', 'Back to asset selection')" @click="selectedCrypto = null">
        <span aria-hidden="true">‹</span>
      </button>
      <a v-else class="topup-header-action" href="#/pages/setting/user" :aria-label="localizedText('返回個人中心', 'Back to profile')">
        <span aria-hidden="true">‹</span>
      </a>
      <div class="font-headline text-lg font-bold text-on-surface">{{ pageTitle }}</div>
      <a class="topup-header-action" href="#/pages/setting/fundRecord" :aria-label="localizedText('充值紀錄', 'Top up records')">
        <img :src="profileBellIcon" alt="" aria-hidden="true" />
      </a>
    </header>

    <main class="topup-page mx-auto max-w-lg px-4 pt-20 pb-10">
      <template v-if="!selectedCrypto">
        <section class="topup-switch" role="tablist" :aria-label="localizedText('充值類型', 'Top up type')">
          <button type="button" class="topup-switch__tab" :class="{ 'topup-switch__tab--active': activeTab === 'crypto' }" @click="activeTab = 'crypto'">
            <span class="topup-switch__icon topup-switch__icon--crypto"><img :src="topupUsdtIcon" alt="" aria-hidden="true" /></span>
            <span>{{ localizedText('加密貨幣', 'Crypto currency') }}</span>
          </button>
          <button type="button" class="topup-switch__tab" :class="{ 'topup-switch__tab--active': activeTab === 'fiat' }" @click="activeTab = 'fiat'">
            <span class="topup-switch__icon"><img :src="topupFiatIcon" alt="" aria-hidden="true" /></span>
            <span>{{ localizedText('法幣', 'Fiat') }}</span>
          </button>
        </section>

        <label class="topup-search" :for="activeTab === 'crypto' ? 'crypto-search' : 'fiat-search'">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
          <input :id="activeTab === 'crypto' ? 'crypto-search' : 'fiat-search'" v-model.trim="searchQuery" :placeholder="activeTab === 'crypto' ? localizedText('搜尋加密貨幣', 'Search crypto') : localizedText('搜尋法幣', 'Search fiat')" autocomplete="off" type="search" />
        </label>

        <section v-if="activeTab === 'crypto'" class="topup-asset-section">
          <h2>{{ localizedText('選擇加密資產', 'Choose crypto asset') }}</h2>
          <div class="topup-asset-list">
            <button v-for="asset in filteredCryptoAssets" :key="asset.code" type="button" class="topup-asset-card" @click="selectCryptoAsset(asset)">
              <img class="topup-asset-card__icon" :src="asset.icon" alt="" aria-hidden="true" />
              <span class="topup-asset-card__body">
                <strong>{{ asset.code }}</strong>
                <span>{{ asset.name }}</span>
              </span>
              <span class="topup-asset-card__chevron" aria-hidden="true">›</span>
            </button>
          </div>
        </section>

        <section v-else class="topup-asset-section">
          <h2>{{ localizedText('選擇法幣充值', 'Choose fiat top up') }}</h2>
          <div class="topup-asset-list">
            <a v-for="asset in filteredFiatAssets" :key="asset.code" class="topup-asset-card" :href="asset.href">
              <img class="topup-asset-card__icon" :src="topupFiatIcon" alt="" aria-hidden="true" />
              <span class="topup-asset-card__body">
                <strong>{{ asset.code }}</strong>
                <span>{{ asset.name }}</span>
              </span>
              <span class="topup-asset-card__chevron" aria-hidden="true">›</span>
            </a>
          </div>
        </section>
      </template>

      <template v-else>
        <section class="topup-selected-summary">
          <img :src="selectedCrypto.icon" alt="" aria-hidden="true" />
          <div>
            <strong>{{ selectedCrypto.code }}</strong>
            <span>{{ selectedCrypto.name }}</span>
          </div>
        </section>

        <section class="usdt-card p-[18px]">
          <div class="space-y-5 text-sm">
            <div>
              <div class="mb-2 font-semibold text-on-surface">{{ $t('phrases.網絡') }}</div>
              <div class="flex flex-wrap gap-2.5" role="group" :aria-label="$t('phrases.鏈上網絡')">
                <button
                  v-for="net in selectedAssetNetworks"
                  :key="net.code"
                  type="button"
                  class="usdt-pill"
                  :class="{ 'usdt-pill--active': network === net.code, 'usdt-pill--unavailable': !isNetworkProvided(net.code) }"
                  :aria-pressed="network === net.code ? 'true' : 'false'"
                  @click="network = net.code"
                >
                  {{ networkDisplayName(net.code) }}
                </button>
              </div>
            </div>

            <div>
              <div class="mb-2 font-semibold text-on-surface">{{ $t('phrases.收款地址') }}</div>
              <LoadingInlineSpinner v-if="depositLoading" :aria-label="$t('phrases.地址載入')" />
              <div v-else-if="depositError" class="rounded-[18px] border border-outline-variant/25 bg-surface-container-low/60 px-4 py-4 text-center text-sm">
                <p class="text-on-surface-variant">{{ depositError }}</p>
                <button type="button" class="mt-3 inline-flex items-center justify-center rounded-full bg-primary/12 px-4 py-2 text-xs font-bold text-primary-dim hover:bg-primary/18" @click="loadDepositAddress">{{ $t('phrases.重試') }}</button>
              </div>
              <div v-else-if="hasDepositAddress" class="rounded-[18px] border border-outline-variant/35 bg-gradient-to-b from-white to-surface-container-low/90 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                <div class="flex items-start justify-between gap-3">
                  <button v-if="depositQrUrl" type="button" class="usdt-deposit-qr-btn" :aria-label="localizedText('放大充值二維碼', 'Enlarge deposit QR code')" @click="openQrPreview">
                    <img class="usdt-deposit-qr" :src="depositQrUrl" :alt="$t('phrases.充值地址 QR')" />
                  </button>
                  <div class="min-w-0 flex-1">
                    <div class="text-xs font-semibold text-on-surface-variant">{{ depositInfo.network_label || (selectedAssetCode + ' · ' + (depositInfo.network_code || network)) }}</div>
                    <p id="usdt-deposit-addr" class="mt-1.5 break-all font-mono text-[13px] leading-relaxed text-on-surface">{{ depositInfo.address }}</p>
                    <p v-if="depositInfo.remark" class="mt-2 text-xs leading-relaxed text-on-surface-variant">{{ $t('phrases.備註：') }}{{ depositInfo.remark }}</p>
                  </div>
                  <button type="button" class="shrink-0 rounded-full border border-outline-variant/30 bg-white px-3 py-1.5 text-xs font-bold text-primary-dim shadow-sm hover:bg-surface-container-low" @click="copyDepositAddress">{{ $t('phrases.複製') }}</button>
                </div>
              </div>
              <div v-else class="eurforex-empty-card eurforex-empty-card--compact">
                <div class="eurforex-empty-illustration" aria-hidden="true">
                  <span class="eurforex-empty-illustration__cube eurforex-empty-illustration__cube--one"></span>
                  <span class="eurforex-empty-illustration__cube eurforex-empty-illustration__cube--two"></span>
                  <span class="eurforex-empty-illustration__cube eurforex-empty-illustration__cube--three"></span>
                  <span class="eurforex-empty-illustration__box"></span>
                </div>
                <div class="eurforex-empty-actions">
                  <a class="eurforex-empty-btn" href="#/pages/index/serviceCenter">{{ $t('phrases.聯繫客服') }}</a>
                </div>
              </div>
            </div>

            <div>
              <label class="mb-2 block font-semibold text-on-surface" for="usdt-amount">{{ $t('phrases.轉賬金額') }}</label>
              <div class="flex min-h-[56px] items-center gap-3 rounded-[18px] border border-outline-variant/35 bg-gradient-to-b from-white to-surface-container-low/90 px-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                <input class="min-w-0 flex-1 border-0 bg-transparent text-base font-bold text-on-surface placeholder:text-on-surface-variant/80 focus:outline-none focus:ring-0" id="usdt-amount" inputmode="decimal" autocomplete="off" placeholder="0" type="text" v-model="amount" />
                <span class="shrink-0 border-l border-outline-variant/25 pl-3 text-[13px] font-extrabold uppercase tracking-wider text-on-surface">{{ selectedAssetCode }}</span>
              </div>
            </div>

            <div>
              <div class="mb-2 font-semibold text-on-surface">{{ $t('phrases.轉賬憑證') }}</div>
              <label class="topup-proof-uploader" :class="{ 'topup-proof-uploader--has-preview': proofPreviewUrl }" for="usdt-proof">
                <input class="sr-only" id="usdt-proof" type="file" accept="image/*" @change="handleProofChange" />
                <span v-if="proofPreviewUrl" class="topup-proof-preview">
                  <img :src="proofPreviewUrl" :alt="localizedText('轉賬憑證預覽', 'Transfer proof preview')" />
                </span>
                <span v-else class="flex h-[54px] w-[54px] items-center justify-center rounded-full bg-primary/12 text-[32px] font-light leading-none text-on-surface">+</span>
                <span v-if="!proofPreviewUrl">
                  <span class="block text-sm font-extrabold text-on-surface">{{ proofPreviewUrl ? localizedText('已選擇轉賬憑證', 'Transfer proof selected') : $t('phrases.上傳轉賬憑證') }}</span>
                  <span class="mt-1 block text-xs text-on-surface-variant" data-proof-hint>{{ proofHint }}</span>
                </span>
              </label>
            </div>

            <button type="button" class="usdt-confirm mt-1 flex h-[52px] w-full items-center justify-center rounded-full font-headline text-base font-bold tracking-wide" :disabled="submitting" @click="handleConfirm">{{ submitting ? ('◌ ' + submitStageText) : $t('phrases.確認') }}</button>
            <p v-if="submitting" class="px-1 text-center text-xs text-on-surface-variant">{{ submitStageText }}</p>
            <p class="px-1 text-center text-xs leading-relaxed text-on-surface-variant">{{ $t('phrases.選擇網絡、複製充值地址、輸入轉賬金額、上傳憑證，最後點擊確認即可提交。若系統要求「充值備註」，請填寫交易哈希或轉賬說明以便自動對賬；未上傳有效憑證時可能被駁回或延遲審核。') }}</p>
          </div>
        </section>
      </template>
    </main>

    <div v-if="qrPreviewOpen" class="qr-preview-overlay" role="dialog" aria-modal="true" :aria-label="localizedText('充值二維碼預覽', 'Deposit QR preview')" @click.self="closeQrPreview">
      <button type="button" class="qr-preview-close" :aria-label="localizedText('關閉', 'Close')" @click.stop.prevent="closeQrPreview">×</button>
      <section class="qr-preview-card">
        <div class="qr-preview-card__title">{{ selectedAssetCode }} {{ networkDisplayName(network) }}</div>
        <img class="qr-preview-image" :src="depositQrUrl" :alt="$t('phrases.充值地址 QR')" />
        <p class="qr-preview-address">{{ depositInfo && depositInfo.address ? depositInfo.address : '' }}</p>
        <p class="qr-preview-hint">{{ localizedText('長按二維碼即可保存圖片', 'Long press the QR code to save image') }}</p>
        <button type="button" class="qr-preview-copy" @click="copyDepositAddress">{{ localizedText('複製地址', 'Copy address') }}</button>
      </section>
    </div>
  </div>
</template>

<script>
import { brandMarkLogo } from '@/assets/images'
import profileBellIcon from '@/static/icons/profile/bell.svg'
import topupFiatIcon from '@/static/icons/topup/fiat.svg'
import topupUsdtIcon from '@/static/icons/topup/usdt.svg'
import topupUsdcIcon from '@/static/icons/topup/usdc.svg'
import topupBtcIcon from '@/static/icons/topup/btc.svg'
import topupEthIcon from '@/static/icons/topup/eth.svg'
import topupTrxIcon from '@/static/icons/topup/trx.svg'
import { userApi } from '@/utils/api'
import QRCode from 'qrcode'

var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--deposit",
  "font-body",
  "min-h-screen",
  "bg-background",
  "pb-28",
  "text-on-surface",
  "antialiased"
];

export default {
  name: "DepositH5",
  data: function () {
    return {
      logoSrc: brandMarkLogo,
      profileBellIcon: profileBellIcon,
      topupFiatIcon: topupFiatIcon,
      topupUsdtIcon: topupUsdtIcon,
      activeTab: "crypto",
      searchQuery: "",
      selectedCrypto: null,
      cryptoAssets: [
        { code: "USDT", name: "Tether USD", icon: topupUsdtIcon, networks: [{ code: "TRC20" }, { code: "BEP20" }, { code: "ERC20" }, { code: "SOLANA" }] },
        { code: "USDC", name: "USD Coin", icon: topupUsdcIcon, networks: [{ code: "ERC20" }, { code: "BEP20" }, { code: "SOLANA" }] },
        { code: "BTC", name: "Bitcoin", icon: topupBtcIcon, networks: [{ code: "BTC" }, { code: "ERC20" }, { code: "BEP20" }] },
        { code: "ETH", name: "Ethereum", icon: topupEthIcon, networks: [{ code: "ERC20" }, { code: "BTC" }] },
        { code: "TRX", name: "TRON", icon: topupTrxIcon, networks: [{ code: "TRC20" }, { code: "ERC20" }] }
      ],
      fiatAssets: [
        { code: "EUR", name: "Euro", href: "#/pages/setting/eurDeposit" },
        { code: "CHF", name: "Swiss Franc", href: "#/pages/index/serviceCenter" },
        { code: "USD", name: "US Dollar", href: "#/pages/index/serviceCenter" },
        { code: "GBP", name: "Pound Sterling", href: "#/pages/index/serviceCenter" }
      ],
      network: "TRC20",
      amount: "",
      proofHint: this.$t("phrases.上傳憑證"),
      depositLoading: false,
      depositError: "",
      depositInfo: null,
      depositNetworks: [],
      depositQrUrl: "",
      qrPreviewOpen: false,
      proofFile: null,
      proofPreviewUrl: "",
      proofPreviewObjectUrl: "",
      submitting: false,
      submitStage: ""
    };
  },
  computed: {
    pageTitle: function () {
      if (this.selectedCrypto) return this.selectedCrypto.code + " " + this.localizedText("充值", "Top up");
      return this.localizedText("充值", "Top up");
    },
    selectedAssetCode: function () {
      return (this.selectedCrypto && this.selectedCrypto.code) || "USDT";
    },
    selectedAssetNetworks: function () {
      return (this.selectedCrypto && this.selectedCrypto.networks) || [{ code: "TRC20" }, { code: "ERC20" }, { code: "BEP20" }];
    },
    filteredCryptoAssets: function () {
      return this.filterAssets(this.cryptoAssets);
    },
    filteredFiatAssets: function () {
      return this.filterAssets(this.fiatAssets);
    },
    hasDepositAddress: function () {
      var d = this.depositInfo;
      if (!d || !d.address) return false;
      return String(d.address).trim() !== "";
    },
    submitStageText: function () {
      if (this.submitStage === "uploading") return this.$t("phrases.上傳憑證中...");
      if (this.submitStage === "submitting") return this.$t("phrases.送出充值申請中...");
      return this.$t("phrases.提交中...");
    }
  },
  watch: {
    network: function () {
      if (this.selectedCrypto) this.loadDepositAddress();
    },
    activeTab: function () {
      this.searchQuery = "";
    }
  },
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) {
        document.body.classList.add(BODY_CLASSES[i]);
      }
      document.body.setAttribute("data-nc2c-page", "deposit");
      document.body.setAttribute("data-nc2c-locked", "true");
    } catch (e) {}
    this.loadSharedScript("/static/previews/shared/marble-bg.js", "eurforexMarbleBgJs");
    this.loadSharedScript("/static/previews/shared/back-nav.js", "eurforexBackNav");
  },
  beforeDestroy: function () {
    this.clearProofPreview();
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
    filterAssets: function (items) {
      var q = String(this.searchQuery || "").trim().toLowerCase();
      if (!q) return items;
      return items.filter(function (item) {
        return String(item.code + " " + item.name).toLowerCase().indexOf(q) !== -1;
      });
    },
    networkDisplayName: function (code) {
      var value = String(code || "").trim().toUpperCase();
      return value === "SOLANA" ? "SOL" : value;
    },
    selectCryptoAsset: function (asset) {
      var nextNetwork = (asset.networks && asset.networks[0] && asset.networks[0].code) || "TRC20";
      this.selectedCrypto = asset;
      if (this.network === nextNetwork) {
        this.loadDepositAddress();
      } else {
        this.network = nextNetwork;
      }
    },
    isNetworkProvided: function (networkCode) {
      var code = String(networkCode || "").trim().toUpperCase();
      return this.depositNetworks.some(function (item) {
        return String(item.network_code || "").trim().toUpperCase() === code;
      });
    },
    loadDepositAddress: function () {
      var self = this;
      this.depositLoading = true;
      this.depositError = "";
      this.depositQrUrl = "";
      this.depositNetworks = [];
      this.depositInfo = null;
      return userApi
        .appConfig({ deposit_asset: this.selectedAssetCode, deposit_network: this.network })
        .then(function (data) {
          var fin = (data && data.finance) || {};
          self.depositNetworks = fin.deposit_networks || fin.usdt_deposit_networks || [];
          self.depositInfo = fin.deposit_address || (self.selectedAssetCode === "USDT" ? fin.usdt_deposit_address : null) || null;
          return self.refreshDepositQr();
        })
        .catch(function (err) {
          self.depositInfo = null;
          self.depositError = (err && err.message) || self.$t("phrases.載入失敗");
        })
        .finally(function () {
          self.depositLoading = false;
        });
    },
    refreshDepositQr: function () {
      var self = this;
      var text = this.depositInfo && this.depositInfo.address ? String(this.depositInfo.address).trim() : "";
      if (!text) {
        this.depositQrUrl = "";
        return Promise.resolve();
      }
      return QRCode.toDataURL(text, { margin: 1, width: 176 }).then(function (url) {
        self.depositQrUrl = url;
      }).catch(function () {
        self.depositQrUrl = "";
      });
    },
    openQrPreview: function () {
      if (!this.depositQrUrl) return;
      this.qrPreviewOpen = true;
      try { document.body.style.overflow = "hidden"; } catch (e) {}
    },
    closeQrPreview: function () {
      this.qrPreviewOpen = false;
      try { document.body.style.overflow = ""; } catch (e) {}
    },
    copyDepositAddress: function () {
      var text = this.depositInfo && this.depositInfo.address ? String(this.depositInfo.address).trim() : "";
      if (!text) return;
      var self = this;
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          self.notify(self.$t("phrases.已複製"));
        }).catch(function () {
          self.fallbackCopyAddress(text);
        });
      } else {
        this.fallbackCopyAddress(text);
      }
    },
    fallbackCopyAddress: function (text) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        this.notify(this.$t("phrases.已複製"));
      } catch (e) {
        this.notify(this.$t("phrases.請手動複製"));
      }
      document.body.removeChild(ta);
    },
    notify: function (message) {
      try {
        if (typeof uni !== "undefined" && typeof uni.showToast === "function") {
          uni.showToast({ title: message, icon: "none", duration: 1800 });
          return;
        }
      } catch (e) {}
    },
    handleProofChange: function (e) {
      var input = e && e.target;
      var f = input && input.files && input.files[0];
      this.clearProofPreview();
      this.proofFile = f || null;
      this.proofHint = f ? f.name : this.$t("phrases.上傳憑證");
      if (!f) return;
      var self = this;
      var isImage = /^image\//i.test(f.type || "") || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(f.name || "");
      if (!isImage) return;
      if (typeof FileReader !== "undefined") {
        var reader = new FileReader();
        reader.onload = function (event) {
          self.proofPreviewUrl = event && event.target ? event.target.result || "" : "";
        };
        reader.readAsDataURL(f);
        return;
      }
      if (typeof URL !== "undefined" && URL.createObjectURL) {
        this.proofPreviewObjectUrl = URL.createObjectURL(f);
        this.proofPreviewUrl = this.proofPreviewObjectUrl;
      }
    },
    clearProofPreview: function () {
      if (this.proofPreviewObjectUrl && typeof URL !== "undefined" && URL.revokeObjectURL) {
        try { URL.revokeObjectURL(this.proofPreviewObjectUrl); } catch (e) {}
      }
      this.proofPreviewUrl = "";
      this.proofPreviewObjectUrl = "";
    },
    openProofPreview: function () {
      if (!this.proofPreviewUrl) return;
      try {
        if (typeof uni !== "undefined" && typeof uni.previewImage === "function") {
          uni.previewImage({ urls: [this.proofPreviewUrl], current: this.proofPreviewUrl });
          return;
        }
      } catch (e) {}
      try { window.open(this.proofPreviewUrl, "_blank"); } catch (e) {}
    },
    handleConfirm: function () {
      var n = parseFloat(String(this.amount || "").replace(/,/g, "").trim());
      if (isNaN(n) || n <= 0) {
        alert(this.$t("phrases.請輸入有效的充值金額。"));
        return;
      }
      if (!this.hasDepositAddress) {
        alert(this.$t("phrases.目前沒有可用充值地址，請聯繫客服。"));
        return;
      }
      if (!this.proofFile) {
        alert(this.$t("phrases.請先上傳轉賬憑證。"));
        return;
      }
      if (this.submitting) return;
      var self = this;
      this.submitting = true;
      this.submitStage = "uploading";
      userApi
        .uploadFile(this.proofFile, "deposit-proof")
        .then(function (upload) {
          self.submitStage = "submitting";
          return userApi.createDepositRequest({
            amount: n.toFixed(8),
            asset_code: self.selectedAssetCode,
            network: self.network,
            proof_url: upload.url || upload.public_url || "",
            reference: self.depositInfo && self.depositInfo.address ? "network:" + self.network : ""
          });
        })
        .then(function (data) {
          window.location.href = "#/pages/setting/rechargeDetail?request_id=" + (data.deposit_request_id || data.request_id || "");
        })
        .catch(function (error) {
          alert((error && error.message) || self.$t("phrases.充值申請提交失敗"));
        })
        .finally(function () {
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

.topup-page {
  min-height: calc(100vh - 3.5rem);
}

.topup-header-logo,
.topup-header-action {
  align-items: center;
  border: 0;
  border-radius: 999px;
  color: #2f73cd;
  display: flex;
  height: 40px;
  justify-content: center;
  text-decoration: none;
  width: 40px;
}

.topup-header-logo img {
  height: 40px;
  object-fit: contain;
  width: 40px;
}

.topup-header-action {
  background: rgba(255, 255, 255, 0.35);
  font-size: 30px;
  font-weight: 300;
  line-height: 1;
}

.topup-header-action img {
  height: 22px;
  width: 22px;
}

.topup-switch {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.58), rgba(235, 249, 255, 0.38));
  border: 1px solid rgba(255, 255, 255, 0.88);
  border-radius: 28px;
  box-shadow: 0 16px 34px rgba(40, 88, 142, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.95);
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 8px;
}

.topup-switch__tab {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 22px;
  color: #5f7084;
  display: inline-flex;
  font-family: Space Grotesk, Manrope, sans-serif;
  font-size: 15px;
  font-weight: 750;
  gap: 10px;
  justify-content: center;
  min-height: 50px;
  min-width: 0;
  padding: 0 12px;
  transition: 0.18s ease;
}

.topup-switch__tab--active {
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 12px 24px rgba(33, 79, 131, 0.11), inset 0 1px 0 rgba(255, 255, 255, 0.95);
  color: #416bed;
}

.topup-switch__icon {
  align-items: center;
  display: flex;
  flex: 0 0 auto;
  height: 26px;
  justify-content: center;
  width: 26px;
}

.topup-switch__icon img {
  height: 26px;
  width: 26px;
}

.topup-search {
  align-items: center;
  background: rgba(255, 255, 255, 0.48);
  border: 1px solid rgba(157, 190, 218, 0.38);
  border-radius: 26px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86);
  color: #617588;
  display: flex;
  gap: 12px;
  margin-top: 34px;
  min-height: 56px;
  padding: 0 18px;
}

.topup-search svg {
  flex: 0 0 auto;
  height: 22px;
  width: 22px;
}

.topup-search input {
  background: transparent;
  border: 0;
  color: #16293f;
  flex: 1;
  font-size: 15px;
  min-width: 0;
  outline: 0;
}

.topup-search input::placeholder {
  color: rgba(97, 117, 136, 0.62);
}

.topup-asset-section {
  margin-top: 34px;
}

.topup-asset-section h2 {
  color: #647789;
  font-family: Space Grotesk, Manrope, sans-serif;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
  margin: 0 0 14px;
  text-transform: uppercase;
}

.topup-asset-list {
  display: grid;
  gap: 10px;
}

.topup-asset-card {
  align-items: center;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.96), rgba(247, 252, 255, 0.82));
  border: 1px solid rgba(255, 255, 255, 0.88);
  border-radius: 22px;
  box-shadow: 0 16px 30px rgba(40, 88, 142, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.96);
  color: #16293f;
  display: grid;
  gap: 14px;
  grid-template-columns: 58px minmax(0, 1fr) auto;
  min-height: 86px;
  padding: 14px 18px;
  text-align: left;
  text-decoration: none;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
  width: 100%;
}

.topup-asset-card:active {
  transform: scale(0.985);
}

.topup-asset-card__icon {
  border-radius: 999px;
  box-shadow: 0 12px 22px rgba(33, 79, 131, 0.14);
  height: 48px;
  width: 48px;
}

.topup-asset-card__body {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.topup-asset-card__body strong {
  color: #16293f;
  font-family: Space Grotesk, Manrope, sans-serif;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
}

.topup-asset-card__body span {
  color: #8192a5;
  font-size: 14px;
  line-height: 1.15;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.topup-asset-card__chevron {
  color: #17283d;
  font-size: 32px;
  font-weight: 300;
  line-height: 1;
}

.topup-selected-summary {
  align-items: center;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(241, 251, 255, 0.76));
  border: 1px solid rgba(255, 255, 255, 0.86);
  border-radius: 24px;
  box-shadow: 0 16px 30px rgba(40, 88, 142, 0.08);
  display: flex;
  gap: 14px;
  margin-bottom: 14px;
  padding: 14px 16px;
}

.topup-selected-summary img {
  height: 48px;
  width: 48px;
}

.topup-selected-summary div {
  display: grid;
  gap: 3px;
}

.topup-selected-summary strong {
  color: #16293f;
  font-size: 20px;
  font-weight: 800;
}

.topup-selected-summary span {
  color: #8192a5;
  font-size: 13px;
}

.usdt-pill--unavailable:not(.usdt-pill--active) {
  opacity: 0.62;
}

.usdt-pill--unavailable.usdt-pill--active {
  border-style: dashed;
}

.usdt-deposit-qr-btn {
  background: #fff;
  border: 1px solid rgba(46, 100, 134, 0.14);
  border-radius: 0.95rem;
  box-shadow: 0 10px 22px rgba(37, 92, 142, 0.08);
  cursor: zoom-in;
  flex-shrink: 0;
  padding: 6px;
  transition: transform .16s ease, box-shadow .16s ease;
}

.usdt-deposit-qr-btn:active {
  box-shadow: 0 6px 14px rgba(37, 92, 142, 0.08);
  transform: scale(.97);
}

.usdt-deposit-qr {
  display: block;
  width: 5.5rem;
  height: 5.5rem;
  border-radius: 0.65rem;
  background: #fff;
  object-fit: cover;
}

.qr-preview-overlay {
  align-items: center;
  background: rgba(9, 22, 38, 0.68);
  backdrop-filter: blur(10px);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 24px;
  position: fixed;
  z-index: 12000;
}

.qr-preview-close {
  align-items: center;
  background: rgba(255, 255, 255, 0.94);
  border: 0;
  border-radius: 999px;
  color: #24364d;
  display: inline-flex;
  font-size: 28px;
  height: 42px;
  justify-content: center;
  line-height: 1;
  position: absolute;
  right: 18px;
  top: calc(18px + env(safe-area-inset-top));
  width: 42px;
  z-index: 2;
}

.qr-preview-card {
  background:
    radial-gradient(circle at 50% 0%, rgba(100, 190, 255, .14), transparent 42%),
    linear-gradient(180deg, rgba(255,255,255,.98), rgba(246,251,255,.96));
  border: 1px solid rgba(218, 232, 244, .92);
  border-radius: 28px;
  box-shadow: 0 26px 70px rgba(0, 22, 48, .28);
  max-width: 360px;
  padding: 22px 20px 20px;
  text-align: center;
  width: 100%;
}

.qr-preview-card__title {
  color: #17263d;
  font-family: var(--font-headline, inherit);
  font-size: 18px;
  font-weight: 850;
  margin-bottom: 16px;
}

.qr-preview-image {
  -webkit-touch-callout: default;
  background: #fff;
  border: 12px solid #fff;
  border-radius: 22px;
  box-shadow: 0 16px 36px rgba(31, 84, 135, .12);
  display: block;
  margin: 0 auto;
  max-width: min(72vw, 280px);
  user-select: auto;
  width: 280px;
}

.qr-preview-address {
  color: #33465d;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.55;
  margin: 16px auto 0;
  overflow-wrap: anywhere;
}

.qr-preview-hint {
  color: #7b8da2;
  font-size: 12px;
  margin-top: 12px;
}

.qr-preview-copy {
  background: linear-gradient(135deg, #5a8df8, #285ccf);
  border-radius: 999px;
  box-shadow: 0 12px 26px rgba(43, 94, 207, .24);
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  margin-top: 16px;
  min-height: 44px;
  padding: 0 24px;
}

.topup-proof-uploader {
  align-items: center;
  background: linear-gradient(180deg, rgba(86, 175, 232, 0.06), rgba(86, 175, 232, 0.03));
  border: 1px dashed rgba(86, 175, 232, 0.35);
  border-radius: 22px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  min-height: 138px;
  padding: 20px;
  text-align: center;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.topup-proof-uploader:hover {
  border-color: rgba(86, 175, 232, 0.5);
}

.topup-proof-uploader--has-preview {
  align-items: stretch;
  border-style: solid;
  gap: 12px;
  padding: 10px 10px 14px;
}

.topup-proof-preview {
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(205, 224, 239, 0.84);
  border-radius: 18px;
  box-shadow: 0 14px 28px rgba(33, 79, 131, 0.1);
  display: block;
  height: 178px;
  overflow: hidden;
  padding: 0;
  width: 100%;
}

.topup-proof-preview img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

@media (max-width: 374px) {
  .topup-switch__tab {
    font-size: 13px;
    gap: 7px;
    padding: 0 8px;
  }

  .topup-asset-card {
    grid-template-columns: 52px minmax(0, 1fr) auto;
    padding-left: 14px;
    padding-right: 14px;
  }

  .topup-asset-card__body strong {
    font-size: 20px;
  }
}
</style>
