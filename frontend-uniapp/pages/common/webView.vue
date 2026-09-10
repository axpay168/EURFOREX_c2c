<template>
  <div>
    <main class="max-w-5xl mx-auto px-4 py-8">
      <section class="glass-panel rounded-[28px] p-5 md:p-6">
        <div class="flex items-center justify-between gap-4">
          <a class="text-sm text-on-surface-variant" href="#/pages/index/serviceCenter" @click="backGo($event, '#/pages/index/serviceCenter')">{{ localizedText('返回', 'Back') }}</a>
          <div><p class="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">{{ localizedText('內嵌視窗', 'Embedded window') }}</p><h1 class="font-headline text-2xl">{{ localizedText('內嵌內容容器', 'Embedded content container') }}</h1></div>
          <span class="rounded-full bg-primary-container px-3 py-1 text-xs font-semibold text-primary-dim">iframe / H5</span>
        </div>
        <div class="mt-6 rounded-[24px] border border-outline-variant/20 bg-surface-container-low p-4">
          <div class="rounded-[20px] bg-surface-bright border border-outline-variant/15 min-h-[520px] flex items-center justify-center text-center px-6">
            <div>
              <h2 class="font-headline text-xl">{{ localizedText('外部內容載入區', 'External content loading area') }}</h2>
              <p class="text-sm text-on-surface-variant mt-2">{{ localizedText('此頁對應 webView 容器，用於活動頁、公告詳情或合作方 H5 內容嵌入。', 'This page maps to the webView container for campaign pages, announcements, or partner H5 embeds.') }}</p>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-3 mt-6 text-sm">
          <a class="rounded-2xl bg-surface-bright px-4 py-4 border border-outline-variant/15 text-center" href="#/pages/common/article">{{ localizedText('公告文章', 'Announcements') }}</a>
          <a class="rounded-2xl bg-surface-bright px-4 py-4 border border-outline-variant/15 text-center" href="#/pages/index/serviceCenter">{{ localizedText('客服中心', 'Customer Support') }}</a>
          <a class="rounded-2xl bg-surface-bright px-4 py-4 border border-outline-variant/15 text-center" href="#/pages/index/index">{{ localizedText('返回首頁', 'Back to Home') }}</a>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
var BODY_CLASSES = [
  "nc2c-page",
  "nc2c-page--webview",
  "font-body",
  "antialiased",
  "min-h-screen",
  "bg-background",
  "text-on-surface"
];

export default {
  name: "WebviewH5",
  mounted: function () {
    try {
      for (var i = 0; i < BODY_CLASSES.length; i++) {
        document.body.classList.add(BODY_CLASSES[i]);
      }
      document.body.setAttribute("data-nc2c-page", "webview");
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
