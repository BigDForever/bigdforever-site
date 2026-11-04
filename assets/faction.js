/* BigDForever faction layer: entry gate, faction header and menu, faction-tinted pages.
   Loaded in <head> on every page. The choice is remembered in this browser (localStorage "bigd-side").
   Force the entry screen with ?pick on the home page. */
(function () {
  var KEY = "bigd-side";
  var FORM = "https://tally.so/r/5XbVeZ";
  var FEEDBACK = "https://tally.so/r/yXMa9W";
  var KOFI = "https://ko-fi.com/bigdforever";
  var LINES = 8; // number of funny hoard lines set up in the Tally form
  var SIDES = {
    alliance: { name: "Alliance", form: "Alliance", img: "assets/art/alliance-crest.png", badge: "assets/art/alliance-badge.png", word: "assets/art/alliance-lettering.png", tag: "Order, honour, polished boots", cry: "For the Alliance" },
    horde: { name: "Horde", form: "Horde", img: "assets/art/horde-banner.png", badge: "assets/art/horde-badge.png", word: "assets/art/horde-lettering.png", tag: "Zug zug. Lok'tar.", cry: "For the Horde" }
  };
  var PAGES = [
    ["./", "Home"],
    ["map.html", "War Map"],
    ["challenge.html", "Weekly Challenge"],
    ["halls.html", "Hall of Fame & Shame"],
    ["past.html", "Taste of the Past"],
    ["clips.html", "How to clip"],
    ["card.html", "Brag card maker"]
  ];
  var root = document.documentElement;

  function get() { try { var s = localStorage.getItem(KEY); return SIDES[s] ? s : ""; } catch (e) { return ""; } }
  function save(s) { try { localStorage.setItem(KEY, s); } catch (e) {} }
  function apply(s) {
    if (s) root.setAttribute("data-side", s); else root.removeAttribute("data-side");
    try { document.dispatchEvent(new CustomEvent("bigd:side", { detail: s })); } catch (e) {}
  }

  var side = get();
  apply(side);
  var isHome = /(^|\/)(index\.html)?$/.test(location.pathname);
  var wantGate = isHome && (!side || /[?&]pick\b/.test(location.search));
  if (wantGate) root.classList.add("fx-gating");

  // every link to the Tally form pre-picks the visitor's side and a random funny line
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href^='" + FORM + "']");
    if (!a) return;
    var p = ["line=" + (1 + Math.floor(Math.random() * LINES))];
    var s = get();
    if (s) p.unshift("side=" + SIDES[s].form);
    a.href = FORM + "?" + p.join("&");
  }, true);

  function el(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- header: faction badge left, menu right ---------- */
  var closeMenu = function () {}, headEl = null;
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeMenu(true); });
  document.addEventListener("click", function (e) { if (headEl && !headEl.contains(e.target)) closeMenu(false); });
  function buildHeader() {
    var head = document.querySelector("header.top");
    if (!head) return;
    var box = head.querySelector(".wrap") || head;
    var old = head.querySelector(".fx-menu");
    if (old) old.remove();
    box.innerHTML = "";
    head.classList.add("fx-head");
    head.classList.remove("fx-open");

    var s = get(), S = SIDES[s];
    var badge = el("a", "fx-badge");
    badge.href = s ? "./" : "./?pick";
    if (S) {
      badge.innerHTML = '<img src="' + S.badge + '" alt=""><span class="fx-badge-t"><b>' + S.name + '</b><small>BigDForever</small></span>';
      badge.setAttribute("aria-label", "BigDForever home, playing as " + S.name);
    } else {
      badge.innerHTML = '<img src="assets/art/icon-192.png" alt="" class="fx-round"><span class="fx-badge-t"><b>Pick a side</b><small>BigDForever</small></span>';
    }
    box.appendChild(badge);

    var burger = el("button", "fx-burger", '<svg class="fx-ico fx-ico-menu" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none"/></svg><svg class="fx-ico fx-ico-close" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" fill="none"/></svg>');
    burger.type = "button";
    burger.setAttribute("aria-label", "Menu");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-controls", "fx-menu");
    box.appendChild(burger);

    var menu = el("nav", "fx-menu");
    menu.id = "fx-menu";
    menu.setAttribute("aria-label", "Main");
    menu.hidden = true;
    var here = location.pathname.split("/").pop() || "./";
    var list = PAGES.map(function (p) {
      var cur = (p[0] === here) || (p[0] === "./" && (here === "./" || here === "index.html"));
      return '<a href="' + p[0] + '"' + (cur ? ' aria-current="page"' : "") + ">" + p[1] + "</a>";
    }).join("") + '<a href="' + FEEDBACK + '" target="_blank" rel="noopener" class="fx-ext">Feedback: tell us straight</a>';
    var other = s === "alliance" ? "horde" : s === "horde" ? "alliance" : "";
    var swap = "";
    if (other) {
      swap = '<button type="button" class="fx-swap" data-to="' + other + '"><img src="' + SIDES[other].badge + '" alt=""><span><small>Changed your mind?</small><b>Switch to ' + SIDES[other].name + "</b></span></button>";
    } else {
      swap = '<a class="fx-swap" href="./?pick"><img src="assets/art/icon-192.png" alt="" class="fx-round"><span><small>Not chosen yet</small><b>Pick your side</b></span></a>';
    }
    var cog = '<svg class="fx-cog" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M19.4 13a7.6 7.6 0 0 0 0-2l2.1-1.6-2-3.5-2.5 1a7.4 7.4 0 0 0-1.7-1l-.4-2.6h-4l-.4 2.6a7.4 7.4 0 0 0-1.7 1l-2.5-1-2 3.5L4.6 11a7.6 7.6 0 0 0 0 2l-2.1 1.6 2 3.5 2.5-1a7.4 7.4 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.4 7.4 0 0 0 1.7-1l2.5 1 2-3.5zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"/></svg>';
    var settings = '<div class="fx-set"><div class="fx-set-h">' + cog + "<span>Settings</span></div>" + swap +
      (s ? '<a class="fx-replay" href="./?pick">See the pick-your-side screen again</a>' : "") + "</div>";
    menu.innerHTML = '<div class="fx-menu-in"><div class="fx-links">' + list + "</div>" +
      '<div class="fx-cta"><a class="fx-btn" href="' + FORM + '" target="_blank" rel="noopener">Submit a brag</a>' +
      '<a class="fx-btn fx-dc" href="https://discord.gg/Q4wMTybW6b" target="_blank" rel="noopener">Discord</a>' +
      '<a class="fx-btn fx-kofi" href="' + KOFI + '" target="_blank" rel="noopener"><span>War chest</span><small>Fuel the site on Ko-fi</small></a></div>' + settings + "</div>";
    box.appendChild(menu);

    function open(v) {
      menu.hidden = !v;
      burger.setAttribute("aria-expanded", v ? "true" : "false");
      head.classList.toggle("fx-open", v);
    }
    burger.addEventListener("click", function () { open(menu.hidden); });
    closeMenu = function (focusBurger) { if (!menu.hidden) { open(false); if (focusBurger) burger.focus(); } };
    headEl = head;
    var sw = menu.querySelector("button.fx-swap");
    if (sw) sw.addEventListener("click", function () { var to = sw.getAttribute("data-to"); save(to); apply(to); open(false); buildHeader(); });
  }

  /* ---------- entry gate (home page) ---------- */
  function buildGate() {
    var g = el("div", "fx-gate");
    g.setAttribute("role", "dialog");
    g.setAttribute("aria-modal", "true");
    g.setAttribute("aria-labelledby", "fx-gate-h");
    function half(k) {
      var S = SIDES[k];
      return '<button type="button" class="fx-half fx-' + k + '" data-side="' + k + '" aria-label="Join the ' + S.name + '">' +
        '<span class="fx-glow" aria-hidden="true"></span>' +
        '<img class="fx-art" src="' + S.img + '" alt="">' +
        '<img class="fx-name" src="' + S.word + '" alt="' + S.name + '">' +
        '<span class="fx-tag">' + esc(S.tag) + "</span></button>";
    }
    g.innerHTML = '<div class="fx-gate-top"><span class="fx-word">Big<span>D</span>Forever</span><h1 id="fx-gate-h">Pick your side.</h1></div>' +
      '<div class="fx-halves">' + half("alliance") + '<span class="fx-vs" aria-hidden="true">vs</span>' + half("horde") + "</div>" +
      '<p class="fx-gate-foot">WoW Forever brag board · Fan site, not affiliated with Blizzard Entertainment</p>';
    document.body.appendChild(g);

    g.addEventListener("click", function (e) {
      var b = e.target.closest(".fx-half");
      if (!b || g.classList.contains("fx-chosen")) return;
      var s = b.getAttribute("data-side");
      save(s); apply(s);
      g.classList.add("fx-chosen", "fx-chose-" + s);
      buildHeader();
      if (/[?&]pick\b/.test(location.search)) { try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) {} }
      var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
      setTimeout(function () {
        root.classList.remove("fx-gating");
        g.classList.add("fx-out");
        setTimeout(function () { g.remove(); var m = document.querySelector("main"); if (m) { m.setAttribute("tabindex", "-1"); m.focus({ preventScroll: true }); } }, reduce ? 0 : 500);
      }, reduce ? 0 : 650);
    });
  }

  function init() {
    buildHeader();
    if (wantGate) buildGate();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
