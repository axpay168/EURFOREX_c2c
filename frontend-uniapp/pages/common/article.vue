<template>
  <div>
    <main class="max-w-3xl mx-auto px-4 py-8">
      <article class="glass-panel rounded-[28px] p-5 md:p-7">
        <a class="text-sm text-on-surface-variant" href="#/pages/index/serviceCenter" @click="backGo($event, '#/pages/index/serviceCenter')">{{ localizedText("返回", "Back") }}</a>
        <p class="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant mt-5">{{ localizedText("公告", "Announcement") }}</p>
        <h1 class="font-headline text-3xl mt-2">{{ localizedText("EUR 區域法幣清算時間調整公告", "Announcement: Changes to EUR regional fiat settlement timing") }}</h1>
        <div class="text-sm text-on-surface-variant mt-3">{{ localizedText("2026-04-17 · 風控與清算中心", "2026-04-17 · Risk control and settlement team") }}</div>
        <div class="space-y-4 text-[15px] leading-7 text-on-surface mt-6">
          <p>{{ localizedText("為了提升歐元入金與出金的處理效率，平台將自本週起調整清算批次時間。所有已提交的申請仍會依既有優先序處理，不影響已完成確認的訂單。", "To improve EUR deposit and withdrawal processing efficiency, the platform will adjust settlement batch times starting this week. All submitted requests will still be handled by existing priority and completed confirmations will remain unaffected.") }}</p>
          <p>{{ localizedText("若你的資金紀錄顯示審核中，請以頁面中的最新狀態為準；如需加急協助，可透過客服中心提交工單並附上訂單編號。", "If your fund record shows Under review, use the latest status shown on the page. For urgent help, submit a ticket via support with your order number.") }}</p>
          <p>{{ localizedText("建議商戶在高峰時段前預留足夠法幣餘額，以維持掛單流動性與接單穩定度。", "Merchants should keep adequate fiat balance before peak hours to maintain order liquidity and fill stability.") }}</p>
        </div>
        <div class="grid grid-cols-2 gap-3 mt-6">
          <a class="rounded-2xl bg-primary-container text-primary-dim text-center px-4 py-3 font-semibold" href="#/pages/common/webView">{{ localizedText("查看原文容器", "View source article") }}</a>
          <a class="rounded-2xl bg-surface-container-low text-on-surface text-center px-4 py-3 font-semibold" href="#/pages/index/serviceCenter">{{ localizedText("聯絡客服", "Contact support") }}</a>
        </div>
      </article>
    </main>
  </div>
</template>

<script>
/**
 * EURFOREX - 文章 (純 H5 Vue2 Options API)
 * 以 docs/previews/nnn/article.html 為唯一基準逐字遷移
 * 外部腳本：../shared/back-nav.js（動態注入）
 */
var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--article",
  "font-body",
  "antialiased",
  "min-h-screen",
  "bg-background",
  "text-on-surface"
];

export default {
  name: "ArticleH5",
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) {
        document.body.classList.add(BODY_CLASSES[i]);
      }
      document.body.setAttribute("data-nc2c-page", "article");
      document.body.setAttribute("data-nc2c-locked", "true");
    } catch (e) {}
    this.loadSharedScript("/static/previews/shared/back-nav.js", "eurforexBackNav");
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
    }
  }
};
</script>

<style>
@import url("../../static/previews/nc2c/css/preview-entry.css");
</style>
