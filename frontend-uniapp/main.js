import Vue from 'vue'
import App from './App'
import RootShell from './RootShell'
import RouteChunkLoading from './components/RouteChunkLoading.vue'
import LoadingInlineSpinner from './components/loading/LoadingInlineSpinner.vue'
import Nc2cCenterSheet from './components/nc2c/Nc2cCenterSheet.vue'
import LanguageSelector from './components/LanguageSelector.vue'
import i18n, { i18nReady, phrase } from './common/i18n'
import { FALLBACK_LANG } from './common/langs'
import { scheduleTranslate } from './common/domTranslator'
import { loadSharedScript } from './utils/loadSharedScript'

function renderI18nBootLoading() {
  try {
    const root = document.getElementById('app')
    if (!root) return
    root.innerHTML = '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#eefaff;color:#1a4a6e;font-family:Manrope,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;"><div style="width:34px;height:34px;border-radius:999px;border:3px solid rgba(26,74,110,.18);border-top-color:#1677ff;animation:eurnyse-i18n-spin .8s linear infinite" aria-label="Loading"></div><style>@keyframes eurnyse-i18n-spin{to{transform:rotate(360deg)}}</style></div>'
  } catch (e) {}
}

Vue.config.productionTip = false
Vue.component('RouteChunkLoading', RouteChunkLoading)
Vue.component('LoadingInlineSpinner', LoadingInlineSpinner)
Vue.component('Nc2cCenterSheet', Nc2cCenterSheet)
Vue.component('LanguageSelector', LanguageSelector)
Vue.mixin({
  mounted() {
    scheduleTranslate(this.$el)
  },
  updated() {
    scheduleTranslate(this.$el)
  },
  methods: {
    loadSharedScript,
    isChineseLocale() {
      var locale = this.$i18n && this.$i18n.locale ? String(this.$i18n.locale) : "";
      return /^zh/i.test(locale);
    },
    localizedText(zhText, enText) {
      // 字典（locales/*.json 的 phrases）一律以繁體中文原文為 key，所以查詢時必須用 zhText。
      const locale = this.$i18n && this.$i18n.locale ? String(this.$i18n.locale) : ""
      const ownMessages = locale && this.$i18n && typeof this.$i18n.getLocaleMessage === "function"
        ? (this.$i18n.getLocaleMessage(locale) || {})
        : {}
      const ownPhrases = ownMessages.phrases || {}
      if (/^zh/i.test(locale)) {
        // 中文語系只查自己的字典，查不到就顯示中文原文，絕不退回英文
        return (zhText && ownPhrases[zhText]) || zhText || enText || ""
      }
      if (locale && locale !== FALLBACK_LANG) {
        // 其他語系：先用中文 key 找「目前語系自己」的譯文，找不到才退回英文
        const ownPhrase = (zhText && ownPhrases[zhText]) || (enText && ownPhrases[enText])
        if (ownPhrase) return ownPhrase
      }
      // 英文語系或沒有譯文：優先使用模板內的英文文案
      return enText || (zhText ? phrase(zhText, null) : "") || zhText || ""
    },
    $phrase(key, fallback) {
      return phrase(key, fallback)
    }
  }
})
Vue.component('App', RootShell)

App.mpType = 'app'

renderI18nBootLoading()

function mountApp() {
  const app = new Vue({
    i18n,
    ...App
  })
  app.$mount('#app')
}

i18nReady.then(mountApp).catch(function () {
  mountApp()
})
