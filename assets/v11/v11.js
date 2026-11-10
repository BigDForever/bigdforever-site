/* BigDForever v1.1 layout proposals: behaviour. Each block runs only when its key is on (window.V11, see v11-flags.js). */
(function () {
  var V = window.V11 || {};
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var DISCORD = '<svg class="v11-dlogo" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.32 4.37A19.8 19.8 0 0 0 15.43 2.8a13.6 13.6 0 0 0-.63 1.3 18.4 18.4 0 0 0-5.6 0 13 13 0 0 0-.64-1.3A19.7 19.7 0 0 0 3.68 4.37C.56 9.05-.29 13.6.13 18.1a19.9 19.9 0 0 0 6.04 3.06 14.7 14.7 0 0 0 1.3-2.1 12.9 12.9 0 0 1-2.04-.98l.5-.39a14.2 14.2 0 0 0 12.15 0l.5.39c-.65.39-1.33.71-2.05.98.37.74.81 1.44 1.3 2.1a19.8 19.8 0 0 0 6.05-3.06c.5-5.2-.84-9.7-3.56-13.73ZM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.95-2.42 2.16-2.42 2.18 1.1 2.16 2.42c0 1.33-.95 2.42-2.16 2.42Zm7.96 0c-1.18 0-2.16-1.09-2.16-2.42s.95-2.42 2.16-2.42 2.18 1.1 2.16 2.42c0 1.33-.94 2.42-2.16 2.42Z"/></svg>';

  function ready(f) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", f); else f(); }

  ready(function () {
    // [ticker] fill the track so it never shows an empty stretch, and add more news
    if (V.ticker) $$(".ticker .track").forEach(function (tr) {
      var extra = ["Week 1 bounties extended to Wed 18 Nov", "Gnomilation: small targets, big points", "Milk Run: the tauren never see it coming",
        "Clip it. Post it. Get read on air.", "New Short every day at 16:15", "Character names only", "Tag your clip on Discord"];
      var base = $$("span", tr).slice(0, Math.ceil($$("span", tr).length / 2)).map(function (s) { return s.textContent; });
      base = base.concat(extra);
      var half = document.createElement("div"); half.style.display = "flex";
      base.forEach(function (t) { var s = document.createElement("span"); s.textContent = t; half.appendChild(s); });
      tr.textContent = ""; tr.appendChild(half);
      // repeat until one half is wider than the screen, then mirror it so -50% loops seamlessly
      var guard = 0; while (half.scrollWidth < window.innerWidth * 1.1 && guard++ < 6) base.forEach(function (t) { var s = document.createElement("span"); s.textContent = t; half.appendChild(s); });
      var copy = half.cloneNode(true); copy.setAttribute("aria-hidden", "true"); tr.appendChild(copy);
      tr.style.setProperty("--v11tick", Math.round(half.scrollWidth / 55) + "s");
    });

    // [discord] Discord logo inside every Discord button or menu link (text or link points to Discord)
    if (V.discord) {
      var tag = function () {
        $$("a, button").forEach(function (a) {
          if (a.querySelector(".v11-dlogo, svg") || a.closest(".ticker")) return;
          var t = (a.textContent || "").toLowerCase(), h = (a.getAttribute("href") || "").toLowerCase();
          var isBtn = /\b(btn|fx-btn|fx-links|discord)\b/.test(a.className + " " + (a.parentNode && a.parentNode.className || "")) || a.id === "cta-discord" || a.id === "nav-discord" || a.id === "chaos-discord";
          if ((/discord/.test(t) || /discord/.test(h)) && (isBtn || a.closest(".fx-menu,.links,.chaos-cta,.cta,nav"))) a.insertAdjacentHTML("afterbegin", DISCORD);
        });
      };
      tag(); setTimeout(tag, 600); setTimeout(tag, 2000);
      new MutationObserver(function () { clearTimeout(tag._t); tag._t = setTimeout(tag, 120); }).observe(document.body, { childList: true, subtree: true });
    }

    // [header] Talentsmith logo inside the Talents button
    if (V.header) {
      var putLogo = function () {
        var t = document.querySelector(".fx-talents"); if (!t || t.querySelector(".v11-tslogo")) return;
        var im = new Image(); im.className = "v11-tslogo"; im.alt = "";
        var srcs = ["assets/v11/fx/talentsmith-logo.svg", "assets/v11/fx/talentsmith-logo.png"], i = 0;
        im.onerror = function () { i++; if (i < srcs.length) im.src = srcs[i]; else im.remove(); };
        im.src = srcs[0]; t.insertBefore(im, t.firstChild);
      };
      putLogo(); setTimeout(putLogo, 500);
    }

    // [menu] "Settings" becomes "Change your mind"; war chest gets its goblin grease back
    if (V.menu) {
      var fixMenu = function () {
        $$(".fx-set-h").forEach(function (h) { var sp = h.querySelector("span"); if (sp && sp.textContent !== "Change your mind") { sp.textContent = "Change your mind"; var c = h.querySelector(".fx-cog"); if (c) c.remove(); } });
        $$(".fx-swap small").forEach(function (sm) { if (/changed your mind/i.test(sm.textContent)) sm.remove(); });
        $$(".fx-kofi").forEach(function (k) {
          if (k.dataset.v11) return; k.dataset.v11 = "1";
          var t = k.querySelector("span"), sm = k.querySelector("small");
          if (t) t.innerHTML = '<img class="v11-coin" src="' + new URL("assets/v11/fx/goblin-coin-64.webp", location.href).href + '" alt="" width="20" height="20">War chest';
          if (sm) sm.textContent = "Buy the goblins some grease (Ko-fi)";
        });
      };
      fixMenu(); new MutationObserver(function () { clearTimeout(fixMenu._t); fixMenu._t = setTimeout(fixMenu, 80); }).observe(document.body, { childList: true, subtree: true });
    }

    // [warroom] pictures in every war-room tile (stand-ins until the ChatGPT war map arrives)
    if (V.warroom) {
      // tile 1 = the ChatGPT war map (cover); the others = Dejan's ChatGPT props (cut-outs, 10 Nov)
      var pics = ["map", "bounty", "hall", "past", "clips", "spot", "vault"];
      $$(".war-links .wl").forEach(function (a, i) {
        if (!pics[i]) return;
        var f = i === 0 ? "assets/v11/room/map.jpg" : "assets/v11/room/props/" + pics[i] + ".webp";
        a.style.setProperty("--pic", "url('" + new URL(f, location.href).href + "')");
        if (i) a.classList.add("v11-prop");
      });
    }

    // [chaos] no queues in Forever: the second tile becomes Disconnects
    if (V.chaos) $$(".chaos .tile").forEach(function (t) {
      var h = t.querySelector("h3"); if (h && /queue pain/i.test(h.textContent)) { h.textContent = "Disconnects"; var p = t.querySelector("p"); if (p) p.textContent = "Lag spikes, crashes, the login screen of doom. Show us the pain."; }
    });
  });
})();
