(function (window, document) {
  function initAdminClock() {
    var el = document.getElementById("admin-clock");
    function tick() {
      if (!el) return;
      el.textContent = new Date().toLocaleString("zh-TW", { hour12: false });
    }
    tick();
    window.setInterval(tick, 1000);
  }

  function initTabGroup(root, tabAttr, panelAttr) {
    if (!root) return;
    var tabBtns = root.querySelectorAll("[" + tabAttr + "]");
    var panels = root.querySelectorAll("[" + panelAttr + "]");
    if (!tabBtns.length || !panels.length) return;

    function show(key) {
      if (!key) return;
      tabBtns.forEach(function (btn) {
        var k = btn.getAttribute(tabAttr);
        var on = k === key;
        btn.classList.toggle("is-active", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
        btn.setAttribute("tabindex", on ? "0" : "-1");
      });
      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute(panelAttr) !== key;
      });
    }

    tabBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        show(btn.getAttribute(tabAttr));
      });
    });

    var tablist = root.querySelector('[role="tablist"]');
    if (!tablist) return;
    tablist.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      var active = -1;
      for (var i = 0; i < tabBtns.length; i++) {
        if (tabBtns[i].getAttribute("aria-selected") === "true") {
          active = i;
          break;
        }
      }
      if (active < 0) return;
      event.preventDefault();
      var next = event.key === "ArrowRight"
        ? (active + 1) % tabBtns.length
        : (active - 1 + tabBtns.length) % tabBtns.length;
      var nextKey = tabBtns[next].getAttribute(tabAttr);
      show(nextKey);
      tabBtns[next].focus();
    });
  }

  initAdminClock();
  ["view-home-content", "view-tiers", "view-eur-swap-withdraw-config"].forEach(function (id) {
    initTabGroup(document.getElementById(id), "data-hc-tab", "data-hc-panel");
  });
  initTabGroup(document.getElementById("view-admin-users"), "data-au-tab", "data-au-panel");
})(window, document);
