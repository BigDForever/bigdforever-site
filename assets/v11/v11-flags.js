/* v1.1 proposals switch. Preview: ?v11=wide:a,ticker,bigd:b (kept for the tab while you click around); ?v11= clears.
   Shipping: set window.BIGD_V11 = "wide:a,ticker" in a page before this script (or edit DEFAULT below).
   Each key adds html.v11-<key> (and html.v11-<key>-<option>); window.V11[key] = option or "on". */
(function () {
  var DEFAULT = "";
  var q = new URLSearchParams(location.search).get("v11");
  try { if (q !== null) sessionStorage.setItem("bigd-v11", q); else q = sessionStorage.getItem("bigd-v11"); } catch (e) {}
  var list = [DEFAULT, window.BIGD_V11 || "", q || ""].join(",");
  var h = document.documentElement, map = {};
  list.split(",").map(function (t) { return t.trim(); }).filter(Boolean).forEach(function (t) {
    var kv = t.split(":"); map[kv[0]] = kv[1] || "on";
    h.classList.add("v11-" + kv[0]); if (kv[1]) h.classList.add("v11-" + kv[0] + "-" + kv[1]);
  });
  window.V11 = map;
})();
