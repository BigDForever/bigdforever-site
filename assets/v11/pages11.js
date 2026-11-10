/* v1.1 page proposals (inner pages). Every block is OFF unless its key is on: ?v11=halls,warmap:a,challenge,vault:a,howto,past,spotlight,maker
   Keys: halls · warmap:a|b · challenge · vault:a|b · howto · past · spotlight · maker. Pages are found by their markup, not their file name. */
(function () {
  "use strict";
  var V = window.V11 || {};
  var D = document, H = D.documentElement;
  if (!["halls", "warmap", "challenge", "vault", "howto", "past", "spotlight", "maker"].some(function (k) { return V[k]; })) return;

  /* War Map background picture hook: set to true once assets/v11/pages/war-map-bg.jpg is in (or preview with ?v11=warmap:a,warbg). */
  var WARMAP_BG_READY = false;
  var WARMAP_BG = "assets/v11/pages/war-map-bg.jpg";
  var BRAG = "https://bigdforever.com/brag", DISCORD = "https://bigdforever.com/discord";

  var RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  /* ---------- icons (inline SVG). Filled brand marks: Discord, Twitch, Apple. The rest are simple line glyphs. ---------- */
  var FILLED = {
    discord: "M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.028C.533 9.046-.32 13.58.099 18.058a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.042-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .078-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.099.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z",
    twitch: "M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0 1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z",
    apple: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
    amd: "M3 3h18v18l-5.2-5.2V8.2H8.2zM8.2 10.4v5.4h5.4L8.6 20.8H3.2v-5.4z",
    play: "M8 5v14l11-7z"
  };
  var LINE = {
    nvidia: '<path d="M1.8 12S5.6 5.8 12 5.8 22.2 12 22.2 12 18.4 18.2 12 18.2 1.8 12 1.8 12z"/><path d="M12 8.6A3.4 3.4 0 1 1 8.6 12"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/>',
    medal: '<path d="M8 2.5h3.2l1.6 5.2M16 2.5h-3.2"/><path d="M16 2.5 13.4 8"/><circle cx="12" cy="14.6" r="6.2"/><path d="M12 11.4v6.4M10.2 13l1.8-1.6"/>',
    pc: '<rect x="2.5" y="3.8" width="19" height="12.7" rx="1.6"/><path d="M8.5 20.5h7M12 16.5v4"/><path d="M8.2 7.2h3.3v3H8.2zM12.5 7.2h3.3v3h-3.3zM8.2 11.2h3.3v2.6H8.2zM12.5 11.2h3.3v2.6h-3.3z" fill="currentColor" stroke="none"/>',
    trophy: '<path d="M7 3.5h10v5.2a5 5 0 0 1-10 0z"/><path d="M7 5.5H4v1.6A3.6 3.6 0 0 0 7.6 10.7M17 5.5h3v1.6a3.6 3.6 0 0 1-3.6 3.6"/><path d="M12 13.7v3.3M8 20.5h8M9.4 17h5.2v3.5H9.4z"/>',
    target: '<circle cx="12" cy="12" r="7.8"/><circle cx="12" cy="12" r="3.2"/><path d="M12 1.8v4.4M12 17.8v4.4M1.8 12h4.4M17.8 12h4.4"/>',
    upload: '<path d="M12 15.5V4M7.5 8.5 12 4l4.5 4.5"/><path d="M4 14v6h16v-6"/>',
    flag: '<path d="M5.5 21.5V3.5"/><path d="M5.5 4h12l-2.6 3.8 2.6 3.8h-12"/>',
    mill: '<path d="M12 9.5 5.5 3M12 9.5 18.5 3M12 9.5 5.5 16M12 9.5l6.5 6.5"/><path d="M9.8 21.5 11 12h2l1.2 9.5z"/>',
    up: '<path d="M6 12.5l6-6 6 6M6 19l6-6 6 6"/>',
    heart: '<path d="M12 20s-7.6-4.6-7.6-10.2A4.3 4.3 0 0 1 12 7.3a4.3 4.3 0 0 1 7.6 2.5C19.6 15.4 12 20 12 20z"/>',
    clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2.1"/>',
    camera: '<path d="M3.2 8.2h4.1l1.6-2.6h6.2l1.6 2.6h4.1v11.3H3.2z"/><circle cx="12" cy="13.6" r="3.5"/>',
    scissors: '<circle cx="6" cy="6.8" r="2.7"/><circle cx="6" cy="17.2" r="2.7"/><path d="M8.3 8.3 20.2 17.4M8.3 15.7 20.2 6.6"/>',
    user: '<circle cx="12" cy="8.2" r="4"/><path d="M4.2 21c0-4.4 3.5-7.6 7.8-7.6s7.8 3.2 7.8 7.6"/>',
    arrow: '<path d="M5 12h13M13 6.5l5.5 5.5-5.5 5.5"/>',
    eye: '<path d="M2 12s3.6-6.2 10-6.2S22 12 22 12s-3.6 6.2-10 6.2S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    film: '<rect x="3" y="4.5" width="18" height="15" rx="1.5"/><path d="M7.5 4.5v15M16.5 4.5v15M3 9h4.5M3 15h4.5M16.5 9H21M16.5 15H21"/>'
  };
  function ico(name, cls) {
    var c = "p11-ico" + (cls ? " " + cls : "") + " p11-ico-" + name;
    if (FILLED[name]) return '<svg class="' + c + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="' + FILLED[name] + '"/></svg>';
    return '<svg class="' + c + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (LINE[name] || "") + "</svg>";
  }
  function prepend(el, name, cls) { if (el && !el.querySelector(".p11-ico")) el.insertAdjacentHTML("afterbegin", ico(name, cls)); }
  /* every Discord link in scope gets the real Discord logo */
  function discordify(scope) {
    $$('a[href*="discord.gg"],a[href$="/discord"]', scope || D).forEach(function (a) {
      if (a.closest(".fx-head,.fx-menu,.fx-gate,footer") || a.querySelector(".p11-ico")) return;
      if (/btn/.test(a.className)) { a.classList.add("p11-has-ico"); prepend(a, "discord"); }
    });
  }

  /* ---------- motion helpers: pause animations when off-screen or in a background tab ---------- */
  D.addEventListener("visibilitychange", function () { H.classList.toggle("p11-tab-hidden", D.hidden); });
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { e.target.classList.toggle("p11-offscreen", !e.isIntersecting); if (e.target._p11vis) e.target._p11vis(e.isIntersecting); });
  }) : null;
  function watch(el, cb) { if (!el) return; if (cb) el._p11vis = cb; if (io) io.observe(el); }

  function cssVar(name, fb) { var v = getComputedStyle(H).getPropertyValue(name).trim(); return v || fb; }

  /* =====================================================================
     1. HALLS: centred hall with a podium (2nd · 1st · 3rd) per wing; the rest in a grid below.
     ===================================================================== */
  function halls() {
    var hall = D.getElementById("hall");
    if (!hall || typeof HALLS === "undefined") return;
    var RANK = { fame: ["Champion", "Runner-up", "Third"], shame: ["Rock bottom", "Nearly as bad", "Also there"] };
    function pic(c) {
      var p = c.img || c.image || c.thumb || "";
      if (p) return p;
      var m = String(c.url || "").match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/i);
      return m ? "https://i.ytimg.com/vi/" + m[1] + "/hqdefault.jpg" : "";
    }
    function fac(c) { return c.faction === "horde" ? "horde" : "alliance"; }
    function strikes(c, w) {
      if (!w.strikes) return "";
      var n = c.strikes || 1;
      return '<span class="p11-strikes" aria-label="' + n + ' of 3 strikes">' + [1, 2, 3].map(function (k) { return '<i class="' + (k <= n ? "on" : "") + '"></i>'; }).join("") + "</span>";
    }
    function statue(c, w) {
      var f = fac(c), p = pic(c);
      return '<article class="p11-statue p11-fa-' + f + '">' +
        '<div class="p11-pic">' + (p ? '<img class="p11-shot" src="' + esc(p) + '" alt="" loading="lazy" onerror="this.remove()">' : "") +
        '<img class="p11-badge" src="assets/art/' + f + '-badge.png" alt=""></div>' +
        '<span class="p11-nm">' + esc(c.name) + "</span>" +
        '<span class="p11-fac">' + (f === "horde" ? "Horde" : "Alliance") + (c.week ? " · Week " + esc(c.week) : "") + "</span>" +
        (c.feat ? '<p class="p11-deed">' + esc(c.feat) + "</p>" : "") + strikes(c, w) +
        (c.url ? '<a class="p11-proof" href="' + esc(c.url) + '" target="_blank" rel="noopener">See the proof</a>' : "") +
        "</article>";
    }
    function vacant() {
      return '<a class="p11-statue p11-vacant" href="' + BRAG + '" target="_blank" rel="noopener">' +
        '<div class="p11-pic">' + ico("user") + "</div>" +
        '<span class="p11-nm">Your clip here</span><span class="p11-fac">Post a brag ' + ico("arrow", "p11-sm") + "</span></a>";
    }
    function restCard(c, n, w) {
      var f = fac(c), p = pic(c);
      return '<article class="p11-mini p11-fa-' + f + '"><span class="p11-no">' + n + "</span>" +
        '<div class="p11-pic">' + (p ? '<img class="p11-shot" src="' + esc(p) + '" alt="" loading="lazy" onerror="this.remove()">' : "") + '<img class="p11-badge" src="assets/art/' + f + '-badge.png" alt=""></div>' +
        '<div class="p11-mini-t"><span class="p11-nm">' + esc(c.name) + '</span><span class="p11-fac">' + (f === "horde" ? "Horde" : "Alliance") + (c.week ? " · Week " + esc(c.week) : "") + "</span>" +
        (c.feat ? '<p class="p11-deed">' + esc(c.feat) + "</p>" : "") + strikes(c, w) +
        (c.url ? '<a class="p11-proof" href="' + esc(c.url) + '" target="_blank" rel="noopener">See the proof</a>' : "") + "</div></article>";
    }
    function podium(w, which) {
      var L = w.list || [];
      return '<div class="p11-podium" role="list">' + [1, 0, 2].map(function (i) {
        return '<div class="p11-step p11-step-' + (i + 1) + '" role="listitem">' + (L[i] ? statue(L[i], w) : vacant()) +
          '<div class="p11-plinth"><b>' + (i + 1) + "</b><span>" + RANK[which][i] + "</span></div></div>";
      }).join("") + "</div>";
    }
    function decorate(which) {
      var h = HALLS[which]; if (!h) return;
      var secs = $$("section.wing", hall);
      secs.forEach(function (sec, i) {
        var w = h.wings[i], cards = $(".cards", sec); if (!w || !cards) return;
        var L = w.list || [], html = podium(w, which);
        if (!L.length && w.empty) html += '<p class="p11-empty">' + esc(w.empty) + "</p>";
        if (L.length > 3) html += '<div class="p11-rest">' + L.slice(3).map(function (c, j) { return restCard(c, j + 4, w); }).join("") + "</div>";
        var box = D.createElement("div"); box.className = "p11-wingbody"; box.innerHTML = html;
        cards.replaceWith(box);
        sec.classList.add(i === 0 ? "p11-lead" : "p11-sub");
      });
      if (secs.length > 1) { var g = D.createElement("div"); g.className = "p11-wings"; secs.slice(1).forEach(function (s) { g.appendChild(s); }); hall.appendChild(g); }
    }
    var orig = window.show;
    if (typeof orig === "function") window.show = function (which) { orig.apply(this, arguments); decorate(which); };
    decorate(D.body.dataset.hall || "fame");
    discordify(D.querySelector("main"));
  }

  /* =====================================================================
     2. WAR MAP: no brown waves, dark textured sea with slow faction motes, coloured title, breathing "Post a brag".
        a = current blue/red · b = deeper Horde red and richer Alliance navy.
     ===================================================================== */
  function warmap(opt) {
    var map = $(".map"), svg = D.getElementById("war");
    if (!map || !svg) return;
    var h1 = $("main h1");
    if (h1 && !h1.querySelector(".p11-w")) {
      var words = h1.textContent.trim().split(/\s+/);
      h1.innerHTML = words.map(function (w, i) { return '<span class="p11-w p11-w' + (i + 1) + (/^war$/i.test(w) ? " p11-war" : "") + '">' + esc(w) + "</span>"; }).join(" ");
      h1.setAttribute("aria-label", words.join(" "));
      watch(h1);
    }
    watch($("#panel"));
    if (WARMAP_BG_READY || V.warbg) { map.classList.add("p11-hasbg"); map.style.setProperty("--p11-mapbg", 'url("' + WARMAP_BG + '")'); }

    // option b: deeper palette on the map itself (zone fills come from the page's fills(); swap it and redraw)
    if (opt === "b" && typeof window.fills === "function" && typeof window.render === "function") {
      var hexs = function (c) { return [1, 3, 5].map(function (i) { return parseInt(c.slice(i, i + 2), 16); }); };
      var mixc = function (c1, c2, t) { var a = hexs(c1), b = hexs(c2); return "#" + a.map(function (v, i) { return Math.round(v + (b[i] - v) * t).toString(16).padStart(2, "0"); }).join(""); };
      var NEUTRAL = "#514431";
      window.fills = function (name, maxT) {
        var s = status(name), d = DATA[name], t = d.a + d.h;
        if (s === "n") return [NEUTRAL, "#5f513b"];
        if (s === "c") return ["url(#contested)", "url(#contestedH)"];
        var k = .35 + .65 * Math.min(1, t / Math.max(1, maxT));
        var deep = s === "a" ? "#132c66" : "#7a110c", lite = s === "a" ? "#2f63c4" : "#a3170f";
        var f = mixc(mixc(NEUTRAL, deep, .72 + .28 * k), lite, .3 * k);
        return [f, mixc(f, "#ffffff", .14)];
      };
      try { render(); } catch (e) {}
    }

    // drifting motes behind the map
    var cv = D.createElement("canvas"); cv.className = "p11-motes"; cv.setAttribute("aria-hidden", "true");
    map.insertBefore(cv, map.firstChild);
    var ctx = cv.getContext("2d"), W = 0, Hh = 0, dpr = 1, motes = [], cols = [], running = false, vis = true, last = 0, raf = 0;
    function palette() {
      var s = cssVar("--side", "#d9a441"), s2 = cssVar("--side-2", "#d9a441");
      if (opt === "b") { if (H.dataset.side === "horde") s = "#c0221a"; if (H.dataset.side === "alliance") s = "#3d74d6"; }
      cols = [s, s, s2];
    }
    function size() {
      var r = map.getBoundingClientRect(); dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.max(1, r.width); Hh = Math.max(1, r.height);
      cv.width = Math.round(W * dpr); cv.height = Math.round(Hh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(70, Math.max(18, W * Hh / 9000)));
      while (motes.length < n) motes.push(seed({}, true));
      motes.length = n;
      if (!running) draw(0);
    }
    function seed(m, any) {
      m.x = Math.random() * W; m.y = any ? Math.random() * Hh : Hh + 6;
      m.r = .6 + Math.random() * 1.6; m.vy = -(4 + Math.random() * 9); m.vx = (Math.random() - .5) * 3;
      m.ph = Math.random() * 6.28; m.a = .22 + Math.random() * .45; m.c = Math.floor(Math.random() * 3); return m;
    }
    function draw(dt) {
      ctx.clearRect(0, 0, W, Hh);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        if (dt) { m.ph += dt * .6; m.y += m.vy * dt; m.x += (m.vx + Math.sin(m.ph) * 2.2) * dt; if (m.y < -6 || m.x < -6 || m.x > W + 6) seed(m, false); }
        var fade = Math.min(1, m.y / (Hh * .25)) * (0.75 + .25 * Math.sin(m.ph * 1.7));
        ctx.globalAlpha = Math.max(0, m.a * fade);
        ctx.fillStyle = cols[m.c] || "#d9a441";
        ctx.shadowColor = cols[m.c] || "#d9a441"; ctx.shadowBlur = 6;
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0;
    }
    function loop(t) {
      if (!running) return;
      raf = requestAnimationFrame(loop);
      if (t - last < 33) return;                 // ~30 fps is plenty for slow motes
      var dt = last ? Math.min(.1, (t - last) / 1000) : 0; last = t; draw(dt);
    }
    function sync() {
      var go = !RM && vis && !D.hidden;
      if (go && !running) { running = true; last = 0; raf = requestAnimationFrame(loop); }
      else if (!go && running) { running = false; cancelAnimationFrame(raf); }
    }
    palette(); size(); sync();
    watch(map, function (v) { vis = v; sync(); });
    D.addEventListener("visibilitychange", sync);
    D.addEventListener("bigd:side", function () { palette(); if (!running) draw(0); });
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(size, 150); });
  }

  /* =====================================================================
     3. WEEKLY CHALLENGE: hover borders + icons.
     ===================================================================== */
  function challenge() {
    var prize = $(".prize b"); prize && prize.classList.add("p11-has-ico"); prepend(prize, "trophy");
    $$(".cta .btn").forEach(function (a) {
      if (/discord/.test(a.href)) return;
      a.classList.add("p11-has-ico"); prepend(a, /tally|brag/.test(a.href) ? "upload" : "arrow");
    });
    discordify($("main"));
    var map = { "Behind Enemy Lines": "flag", "Tarren Mill Classic": "mill", "David and Goliath": "up", "Make Love Not War": "heart" };
    $$(".next > div").forEach(function (d) {
      var b = $("b", d); if (!b || d.querySelector(".p11-ico")) return;
      d.insertAdjacentHTML("afterbegin", '<span class="p11-chip-ico">' + ico(map[b.textContent.trim()] || "target") + "</span>");
    });
    $$(".bounty").forEach(function (b) { var who = $(".who", b); if (who) { who.classList.add("p11-has-ico"); prepend(who, "target"); } });
  }

  /* =====================================================================
     4. CLIP VAULT: a = mosaic (lead card 2x2, featured wide) · b = uniform grid, featured framed + ribbon, every 5th wide.
     ===================================================================== */
  function vault(opt) {
    var grid = D.getElementById("grid"); if (!grid) return;
    var st = $(".status");
    if (st && !$(".p11-tagnote")) st.insertAdjacentHTML("beforeend", '<span class="p11-tagnote">' + ico("discord") + 'Want a tag added? <a href="' + DISCORD + '" target="_blank" rel="noopener">Ask on Discord</a></span>');
    discordify($("main"));
    function decorate() {
      var view = typeof VIEW !== "undefined" ? VIEW : [];
      var sortNew = typeof F === "undefined" || !F.sort || F.sort === "new";
      $$(":scope > article.card", grid).forEach(function (el, i) {
        var c = view[i] || {};
        var feat = !!(c.image || /featur/i.test([c.note, c.category, c.tag].join(" ")));
        var lead = i === 0 && sortNew;
        el.classList.remove("p11-feat", "p11-new", "p11-big", "p11-wide", "p11-fa-horde", "p11-fa-alliance");
        if (c.faction) el.classList.add("p11-fa-" + c.faction.toLowerCase());
        if (feat) el.classList.add("p11-feat"); else if (lead) el.classList.add("p11-new");
        if (opt === "a") {
          if (i === 0) el.classList.add("p11-big");
          else if (feat || i % 7 === 4) el.classList.add("p11-wide");
        } else if ((i + 1) % 5 === 0) el.classList.add("p11-wide");
        var pl = $(".player", el), rib = pl && $(".p11-ribbon", pl);
        if (pl && (feat || lead) && !rib) pl.insertAdjacentHTML("beforeend", '<span class="p11-ribbon">' + (feat ? "Featured" : "Newest") + "</span>");
      });
    }
    new MutationObserver(decorate).observe(grid, { childList: true });
    decorate();
  }

  /* =====================================================================
     5. HOW TO CLIP: platform icons + "Make it count" in one row on PC.
     ===================================================================== */
  function howto() {
    var P = { nvidia: "nvidia", amd: "amd", medal: "medal", gamebar: "pc", mac: "apple" };
    $$(".pick a").forEach(function (a) {
      var k = P[(a.getAttribute("href") || "").replace("#", "")]; if (!k || a.querySelector(".p11-ico")) return;
      a.classList.add("p11-pick"); a.insertAdjacentHTML("afterbegin", '<span class="p11-plat p11-plat-' + k + '">' + ico(k) + "</span>");
    });
    Object.keys(P).forEach(function (id) {
      var sec = D.getElementById(id), h2 = sec && $("h2", sec); if (!h2 || h2.querySelector(".p11-ico")) return;
      h2.classList.add("p11-tool-h"); h2.insertAdjacentHTML("afterbegin", '<span class="p11-plat p11-plat-' + P[id] + '">' + ico(P[id]) + "</span>");
    });
    var tips = $(".tips");
    if (tips) {
      tips.parentElement.classList.add("p11-tips-sec");
      var T = ["clock", "camera", "scissors", "upload"];
      $$(".tip", tips).forEach(function (t, i) { var b = $("b", t); if (b && !t.querySelector(".p11-ico")) t.insertAdjacentHTML("afterbegin", '<span class="p11-chip-ico">' + ico(T[i] || "film") + "</span>"); });
    }
    discordify($("main"));
  }

  /* =====================================================================
     6. TASTE OF THE PAST: picture box on every plaque, bordered Twitch buttons, "Past" in faction colour.
     ===================================================================== */
  function past() {
    var h1 = $("main h1");
    if (h1 && !h1.querySelector(".p11-hl")) h1.innerHTML = esc(h1.textContent).replace(/(Past)(\.?)\s*$/, '<span class="p11-hl">$1</span>$2');
    // thumbnails we already know (same clips appear on the Streamer Spotlight). Anything else gets the crest panel.
    var KNOWN = { RoughTangibleStarlingCclamChamp: "45a8c62e-1a96-49e1-8794-594755bffb4f", PlacidFunSangPeoplesChamp: "74f58e92-bba5-4212-b6a1-eceaaae57448" };
    var TH = function (id) { return "https://static-cdn.jtvnw.net/twitch-video-assets/twitch-vap-video-assets-prod-us-west-2/" + id + "/landscape/thumb/thumb-0000000000-1920x1080.jpg"; };
    var data = typeof PAST !== "undefined" ? PAST : {};
    ["beta", "hc"].forEach(function (id) {
      var list = data[id] || [];
      $$("#" + id + " > .plaque").forEach(function (pl, i) {
        if (pl.querySelector(".p11-pic")) return;
        var c = list[i] || {}, a = $(".watch", pl), url = a ? a.href : (c.url || "");
        var slug = (url.match(/clip\/([A-Za-z]+)/) || [])[1];
        var th = c.th ? (/^https?:/.test(c.th) ? c.th : TH(c.th)) : (c.img || c.thumb || (slug && KNOWN[slug] ? TH(KNOWN[slug]) : ""));
        var box = '<a class="p11-pic' + (c.shame ? " p11-shame" : "") + '" href="' + esc(url) + '" target="_blank" rel="noopener" aria-label="Watch on Twitch: ' + esc(c.t || "") + '">' +
          '<span class="p11-ph"><span class="p11-crest"></span><span class="p11-by">' + esc(c.by || "") + "</span></span>" +
          (th ? '<img src="' + esc(th) + '" alt="" loading="lazy" onerror="this.remove()">' : "") +
          '<span class="p11-play">' + ico("play") + "</span>" + (c.len ? '<span class="p11-len">' + c.len + "s</span>" : "") + "</a>";
        pl.insertAdjacentHTML("afterbegin", box);
        if (a && !a.querySelector(".p11-ico")) { a.classList.add("p11-tw"); prepend(a, "twitch"); }
      });
    });
    discordify($("main"));
  }

  /* =====================================================================
     7. STREAMER SPOTLIGHT: bigger header card, two columns on PC, "Want to be featured?" box.
     ===================================================================== */
  function spotlight() {
    var list = D.getElementById("list"); if (!list) return;
    var first = $(":scope > section", list); if (!first || first.querySelector(".p11-aside")) return;
    var poster = $(".poster", first), img = poster && $(".player img", poster);
    if (poster) { poster.classList.add("p11-poster"); if (img) poster.style.setProperty("--p11-th", 'url("' + img.src + '")'); }
    var tw = $(".btn.tw", first); if (tw) { tw.classList.add("p11-has-ico"); prepend(tw, "twitch"); }
    var spot = typeof SPOT !== "undefined" ? SPOT : [];
    var clips = spot.reduce(function (n, p) { return n + 1 + (p.clips || []).length; }, 0);
    var views = spot.reduce(function (n, p) { return n + (p.clips || []).reduce(function (s, c) { return s + (+c.v || 0); }, 0); }, 0);
    var fmt = function (n) { return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "K" : String(n); };
    var next = String(spot.length + 1).padStart(2, "0");
    var aside = D.createElement("aside"); aside.className = "p11-aside"; aside.setAttribute("aria-label", "Join the spotlight");
    aside.innerHTML =
      '<div class="p11-feature">' + ico("discord", "p11-big-ico") +
      "<b>Want to be featured?</b><p>Streamers: free, no contract, no catch. We clip your Forever moments, credit you every time, link back to your stream and pull anything you want gone.</p>" +
      '<a class="btn discord p11-has-ico" href="' + DISCORD + '" target="_blank" rel="noopener">' + ico("discord") + "Ask on Discord</a>" +
      '<small>or email <a href="mailto:bigdforever.gg@gmail.com">bigdforever.gg@gmail.com</a></small></div>' +
      '<div class="p11-facts"><div><b>' + spot.length + "</b><span>streamer" + (spot.length === 1 ? "" : "s") + " on the wall</span></div><div><b>" + clips + "</b><span>clips in the vault</span></div><div><b>" + fmt(views) + "</b><span>clip views sent their way</span></div></div>" +
      '<a class="p11-slot" href="' + DISCORD + '" target="_blank" rel="noopener"><span class="p11-slot-no">No. ' + next + "</span>" + ico("user") + "<b>This spot is open</b><span>Know a streamer who belongs here? Tell us on Discord.</span></a>" +
      '<a class="p11-pastlink" href="past.html">' + ico("film") + "<span><b>Taste of the Past</b><small>Beta legends and Hardcore graves</small></span>" + ico("arrow", "p11-sm") + "</a>";
    first.classList.add("p11-spot");
    first.appendChild(aside);
    var g = $(".grid", first); if (g) g.classList.add("p11-clips");
    var rules = $("main > section.rules"); if (rules) rules.classList.add("p11-hide");
    discordify($("main"));
  }

  function run() {
    if (V.halls && D.getElementById("hall")) halls();
    if (V.warmap && D.getElementById("war")) warmap(V.warmap === "b" ? "b" : "a");
    if (V.challenge && $(".boards")) challenge();
    // [challenge:b] trash talk has its own Discord channel: #trash-talk, not #challenges (Dejan 10 Nov), on every page
    if (V.challenge === "b") {
      var w = D.createTreeWalker(D.body, NodeFilter.SHOW_TEXT), n, hits = [];
      while ((n = w.nextNode())) if (/#challenges/.test(n.nodeValue) && /trash/i.test(n.nodeValue)) hits.push(n);
      hits.forEach(function (t) { t.nodeValue = t.nodeValue.replace(/#challenges/g, "#trash-talk"); });
      // the Talk trash button lands straight in #trash-talk (invite made from that channel, never expires, 10 Nov)
      $$("a").forEach(function (a) { if (/trash/i.test(a.textContent) && /discord/.test(a.href)) a.href = "https://discord.gg/SvyFRYfpy"; });
    }
    if (V.vault && $(".bar") && D.getElementById("grid")) vault(V.vault === "b" ? "b" : "a");
    if (V.howto && $(".pick") && $(".tool")) howto();
    if (V.past && D.getElementById("beta") && D.getElementById("hc")) past();
    if (V.spotlight && D.getElementById("list") && $(".rules")) spotlight();
    // maker: CSS only
  }
  function safe() { try { run(); } catch (e) { if (window.console) console.warn("pages11:", e); } }
  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", safe); else safe();
})();
