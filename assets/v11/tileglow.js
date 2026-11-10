/* v1.1 [tileglow:a|b|c] hover on war room tiles, Launch Week Chaos tiles and brag cards (round 2 of card 18, Dejan 10 Nov:
   "too small, too localized, radiant light for Alliance, more class"). Off unless ?v11=tileglow:a|b|c.
   a = radiant edge: a band of light runs once round the whole border, then the border stays lit
   b = light from within: a wide soft light follows the mouse across the whole tile (holy white-gold / forge orange)
   c = lift + rim light: the tile rises, a bright rim along the top edge, the picture leans in, a deep shadow under it */
(function () {
  var V = window.V11 || {};
  if (!V.tileglow) return;
  var OPT = /^(a|b|c|ab)$/.test(V.tileglow) ? V.tileglow : "a";
  var SEL = ".war-links .wl, .chaos .tile, #feed .card";
  OPT.split("").forEach(function (o) { document.documentElement.classList.add("tg-" + o); });
  // ab (Dejan 10 Nov, card 40): A's radiant edge + B's inner light at 60 % strength
  if (OPT === "ab") document.documentElement.classList.add("tg-soft");

  var css = document.createElement("style");
  css.textContent = [
    "@property --tg-a{syntax:'<angle>';inherits:false;initial-value:0deg}",
    ":root{--tg-c:#ffcf8a;--tg-c2:#ff5a1f;--tg-soft:rgba(255,120,40,.22)}",
    ":root[data-side='alliance']{--tg-c:#fff6dc;--tg-c2:#e9c46a;--tg-soft:rgba(255,240,200,.20)}",
    ".tg-host{position:relative;isolation:isolate}",
    ".tg,.tgf{position:absolute;inset:-1px;border-radius:inherit;pointer-events:none;z-index:3;opacity:0;transition:opacity .35s ease}",
    // a: radiant edge (a light band travels once round the border, then the whole border glows softly)
    ".tg-a .tg{padding:1.5px;background:conic-gradient(from var(--tg-a),transparent 0 62%,var(--tg-c2) 74%,var(--tg-c) 82%,transparent 92%);" +
      "-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude}",
    ".tg-a .tg::after{content:'';position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px var(--tg-c2),0 0 22px -4px var(--tg-c2);opacity:0;transition:opacity .5s .55s}",
    ".tg-a .tg-host:hover .tg{opacity:1;animation:tgRun .9s cubic-bezier(.3,.6,.3,1) forwards}",
    ".tg-a .tg-host:hover .tg::after{opacity:1}",
    "@keyframes tgRun{from{--tg-a:-40deg}to{--tg-a:320deg}}",
    ".tg-a .tg-host:hover{box-shadow:0 18px 40px -24px #000}",
    // b: light from within (large, soft, follows the pointer; never a small spot)
    ".tg-b .tgf{inset:0;background:radial-gradient(70% 90% at var(--tg-x,50%) var(--tg-y,50%),var(--tg-soft),transparent 70%);mix-blend-mode:screen}",
    ".tg-b .tgf::after{content:'';position:absolute;inset:0;border-radius:inherit;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--tg-c2) 70%,transparent),inset 0 0 40px -10px var(--tg-c2)}",
    ".tg-b .tg-host:hover .tgf{opacity:1}",
    ".tg-soft .tg-host:hover .tgf{opacity:.6}",
    ".tg-soft .tgf::after{box-shadow:none}",
    // c: lift + rim light
    ".tg-c .tg-host{transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s}",
    ".tg-c .tg-host:hover{transform:translateY(-6px)!important;box-shadow:0 26px 46px -22px #000,0 0 0 1px color-mix(in srgb,var(--tg-c2) 60%,transparent)}",
    ".tg-c .tg{inset:0;background:linear-gradient(180deg,color-mix(in srgb,var(--tg-c) 26%,transparent) 0,transparent 22%);box-shadow:inset 0 1.5px 0 var(--tg-c)}",
    ".tg-c .tg-host:hover .tg{opacity:1}",
    ".tg-c .war-links .wl{background-size:auto;transition:transform .35s cubic-bezier(.2,.8,.2,1),box-shadow .35s,background-size .5s}",
    "@media (prefers-reduced-motion:reduce){.tg-a .tg-host:hover .tg{animation:none;--tg-a:0deg}.tg-c .tg-host:hover{transform:none!important}}",
    "@media (hover:none){.tg,.tgf{display:none}}"
  ].join("\n");
  document.head.appendChild(css);

  function add(el) {
    if (el.querySelector(":scope > .tg")) return;
    el.classList.add("tg-host");
    ["tg", "tgf"].forEach(function (c) { var s = document.createElement("i"); s.className = c; s.setAttribute("aria-hidden", "true"); el.insertBefore(s, el.firstChild); });
  }
  function scan() { document.querySelectorAll(SEL).forEach(add); }
  scan(); setTimeout(scan, 800); setTimeout(scan, 2500);
  var feed = document.getElementById("feed"); if (feed) new MutationObserver(scan).observe(feed, { childList: true, subtree: true });

  if (OPT.indexOf("b") !== -1) document.addEventListener("pointermove", function (e) {
    var el = e.target.closest && e.target.closest(".tg-host"); if (!el) return;
    var r = el.getBoundingClientRect();
    el.style.setProperty("--tg-x", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
    el.style.setProperty("--tg-y", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
  }, { passive: true });
})();
