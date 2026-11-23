/* BigD visitor tracking (Umami, shared with the Talentsmith entry; BigD visits carry tag "bigd" and host bigdforever.com).
   Added 23 Nov (Dejan "go"): counts which buttons people use to leave or go deeper. No cookies, nothing shown on the page. */
(function () {
  var NAMES = { "/brag": "brag-form", "/discord": "discord", "/youtube": "youtube", "/tiktok": "tiktok" };
  function kind(u) {
    var h = u.hostname;
    if (/tally\.so$/.test(h)) return /yXMa9W/.test(u.pathname) ? "feedback-form" : "brag-form";
    if (/discord/.test(h)) return "discord";
    if (/youtube\.com$|youtu\.be$/.test(h)) return "youtube";
    if (/tiktok\.com$/.test(h)) return "tiktok";
    if (/twitch\.tv$/.test(h)) return "twitch";
    if (/talentsmith\.app$/.test(h)) return "talentsmith";
    if (/ko-fi\.com$/.test(h)) return "kofi";
    return "outbound";
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || !window.umami || typeof window.umami.track !== "function") return;
    var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
    var from = location.pathname.replace(/\.html$/, "") || "/";
    if (u.host !== location.host) { window.umami.track(kind(u), { from: from, to: u.hostname + u.pathname }); return; }
    var p = u.pathname.replace(/\.html$/, "");
    if (NAMES[p]) { window.umami.track(NAMES[p], { from: from }); return; }
    if (a.closest("#hero-clip")) window.umami.track("hero-more-clips", { from: from });
  }, true);
})();
