/* v1.1 proposals switch. Preview: ?v11=wide:a,ticker,bigd:b (kept for the tab while you click around); ?v11= clears.
   Shipping: set window.BIGD_V11 = "wide:a,ticker" in a page before this script (or edit DEFAULT below).
   Each key adds html.v11-<key> (and html.v11-<key>-<option>); window.V11[key] = option or "on". */
(function () {
  // LIVE (Dejan approved on the Review Board, 10 Nov 17:19): cards 10 (wide B), 11, 12, 13, 14, 15 A, 17, 21, 22, 23, 24
  // + 17:29: 27 vault A, 28, 29, 30, 31, 33 (gate), 34 kill map A (with the War Map page look from 25)
  var DEFAULT = "wide:b,header,ticker,discord,footer,bigd:a,submitfx,chaos,nolines,menu,halls,vault:a,howto,past,spotlight,maker,gate,warmap:a,killmap:a";
  var q = new URLSearchParams(location.search).get("v11");
  try { if (q !== null) sessionStorage.setItem("bigd-v11", q); else q = sessionStorage.getItem("bigd-v11"); } catch (e) {}
  var list = [DEFAULT, window.BIGD_V11 || "", q || ""].join(",");
  var h = document.documentElement, map = {};
  list.split(",").map(function (t) { return t.trim(); }).filter(Boolean).forEach(function (t) {
    var kv = t.split(":"); map[kv[0]] = kv[1] || "on";
    h.classList.add("v11-" + kv[0]); if (kv[1]) h.classList.add("v11-" + kv[0] + "-" + kv[1]);
  });
  window.V11 = map;

  // [crest] the gritty Alliance shield replaces the old crest and badge everywhere (gate, header, Brag Maker canvas)
  if (map.crest) {
    var SWAP = { "assets/art/alliance-crest.png": "assets/v11/crest/alliance-crest-gritty.webp", "assets/art/alliance-badge.png": "assets/v11/crest/alliance-badge-gritty.webp" };
    var fix = function (u) { u = String(u); for (var k in SWAP) if (u.indexOf(k) !== -1) return u.replace(k, SWAP[k]); return u; };
    var d = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src");
    if (d && d.set) Object.defineProperty(HTMLImageElement.prototype, "src", { configurable: true, enumerable: d.enumerable, get: d.get, set: function (v) { d.set.call(this, fix(v)); } });
    var sa = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function (n, v) { return sa.call(this, n, (n === "src" && this.tagName === "IMG") ? fix(v) : v); };
    new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes && m.addedNodes.forEach(function (n) {
      if (n.nodeType !== 1) return; (n.tagName === "IMG" ? [n] : Array.prototype.slice.call(n.querySelectorAll("img"))).forEach(function (i) { var a = i.getAttribute("src") || "", b = fix(a); if (a !== b) i.src = b; });
    }); }); }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
