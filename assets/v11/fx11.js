/* v1.1 effect proposals (fx11). Each block runs only when its key is on (?v11=key or key:option, see v11-flags.js).
   Keys: bigd:a|b|c|d · heroparticles:a|b · socials:a|b|c · submitfx · tilehover · gate.
   Rules: plain JS, one requestAnimationFrame loop per canvas, paused off-screen / in background tabs,
   static calm state with prefers-reduced-motion, DPR-aware canvases, capped particle counts. */
(function () {
  "use strict";
  var V = window.V11 || {}, H = document.documentElement;
  if (!V.bigd && !V.heroparticles && !V.socials && !V.submitfx && !V.tilehover && !V.gate) return;

  var RM = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function (a) { return a[(Math.random() * a.length) | 0]; };
  var side = function () { return H.getAttribute("data-side") === "alliance" ? "alliance" : "horde"; };
  var small = function () { return innerWidth < 761; };
  var DPR = function () { return Math.min(window.devicePixelRatio || 1, 2); };

  /* soft round sprite, tinted copies cached */
  var GLOW = (function () {
    var s = document.createElement("canvas"); s.width = s.height = 64;
    var g = s.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(.22, "rgba(255,255,255,.55)"); gr.addColorStop(.55, "rgba(255,255,255,.14)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return s;
  })();
  var TINT = {};
  function glow(rgb) {
    if (TINT[rgb]) return TINT[rgb];
    var t = document.createElement("canvas"); t.width = t.height = 64; var x = t.getContext("2d");
    x.drawImage(GLOW, 0, 0); x.globalCompositeOperation = "source-in"; x.fillStyle = "rgb(" + rgb + ")"; x.fillRect(0, 0, 64, 64);
    return (TINT[rgb] = t);
  }
  function mix(a, b, t) { return [0, 1, 2].map(function (i) { return Math.round(a[i] + (b[i] - a[i]) * t); }); }
  function ramp(stops, l) { var f = Math.max(0, Math.min(.999, l)) * (stops.length - 1), i = Math.floor(f); return mix(stops[i], stops[i + 1], f - i); }
  var HEAT = [[255, 236, 170], [255, 196, 90], [255, 138, 40], [226, 74, 24], [150, 34, 14]];

  /* image sprites copied from Talentsmith (assets/v11/fx/) */
  var IMG = {}, BASE = (function () { var s = document.querySelector('script[src*="fx11.js"]'); return s ? s.src.replace(/fx11\.js.*$/, "fx/") : "assets/v11/fx/"; })();
  function img(k) { if (!IMG[k]) { var i = new Image(); i.decoding = "async"; i.src = BASE + k + ".webp"; IMG[k] = i; } return IMG[k]; }
  var ok = function (i) { return i && i.complete && i.naturalWidth > 0; };

  /* ---- one rAF loop per canvas: sized to its box, runs only when visible, on screen and motion is allowed ---- */
  function loop(cv, watch, step) {
    var g = cv.getContext("2d"), vis = false, raf = 0, last = 0, W = 0, Hh = 0, d = 1, t0 = performance.now();
    function size() {
      d = DPR(); var r = cv.getBoundingClientRect();
      var w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      W = w; Hh = h;
    }
    function frame(ts) {
      raf = 0; if (!cv.isConnected || !vis || document.hidden || RM.matches) { last = 0; return; }
      var dt = last ? ts - last : 16; last = ts; var k = Math.min(3, dt / 16.67);
      step(g, W, Hh, d, k, (ts - t0) / 1000, false);
      raf = requestAnimationFrame(frame);
    }
    function kick() {
      if (RM.matches) { size(); step(g, W, Hh, d, 0, 0, true); return; }
      if (!raf && vis && !document.hidden) raf = requestAnimationFrame(frame);
    }
    size();
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { vis = es[es.length - 1].isIntersecting; if (watch.classList) watch.classList.toggle("fx-off", !vis); kick(); }, { rootMargin: "60px" }).observe(watch);
    else vis = true;
    document.addEventListener("visibilitychange", kick);
    if (RM.addEventListener) RM.addEventListener("change", kick);
    var rt; addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { size(); if (RM.matches) kick(); }, 120); });
    if ("ResizeObserver" in window) new ResizeObserver(function () { size(); }).observe(cv);
    kick();
    return { size: size, kick: kick };
  }

  /* ===================== 1. BigD title ===================== */
  function bigdTargets() {
    var out = [], hb = document.querySelector(".hero h1 .bd");
    if (hb) { hb.classList.add("fx-bd"); out.push(hb); }
    var j = document.getElementById("join-h") || document.querySelector(".join h2");
    if (j && !j.querySelector(".fx-bd")) {
      for (var n = j.firstChild; n; n = n.nextSibling) {
        if (n.nodeType === 3 && /BigD/.test(n.nodeValue)) {
          var i = n.nodeValue.indexOf("BigD"), rest = n.splitText(i); rest.splitText(4);
          var s = document.createElement("span"); s.className = "fx-bd fx-bd-j"; s.textContent = "BigD";
          rest.parentNode.replaceChild(s, rest); out.push(s); break;
        }
      }
    }
    return out;
  }

  function bigdParticles(span) {
    var host = span.parentElement; host.classList.add("fx-bd-host");
    var cv = document.createElement("canvas"); cv.className = "fx-bd-cv"; cv.setAttribute("aria-hidden", "true");
    host.insertBefore(cv, host.firstChild);
    var L;
    function place() {
      var hr = host.getBoundingClientRect(), r = span.getBoundingClientRect(), fs = parseFloat(getComputedStyle(span).fontSize) || 80;
      var px = fs * .45, py = fs * .55;
      cv.style.left = (r.left - hr.left - px) + "px"; cv.style.top = (r.top - hr.top - py) + "px";
      cv.style.width = (r.width + px * 2) + "px"; cv.style.height = (r.height + py * 1.3) + "px";
      if (L) L.size();
    }
    place();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    addEventListener("resize", place); addEventListener("load", place);
    var P = [], big = span.classList.contains("fx-bd-j") ? .75 : 1;
    L = loop(cv, host, function (g, W, Hh, d, k, t, still) {
      g.clearRect(0, 0, W, Hh); g.globalCompositeOperation = "lighter";
      var al = side() === "alliance", max = Math.round((al ? 16 : 40) * big * (small() ? .6 : 1));
      var spawn = still ? max : (al ? .35 : .9) * k;
      for (var s = 0; P.length < max && s < spawn; s++) {
        if (!still && Math.random() > spawn) break;
        if (al) P.push({ x: rnd(.12, .88) * W, y: rnd(.28, .9) * Hh, l: still ? rnd(.2, .6) : 0, dl: rnd(.006, .011), s: rnd(5, 11) * d * big, rot: rnd(0, .8), c: pick(["255,246,214", "255,226,150", "255,236,190"]), al: 1 });
        else P.push({ x: rnd(.1, .9) * W, y: Hh * rnd(.62, 1), vx: rnd(-.25, .25) * d, vy: -rnd(.35, .9) * d, l: still ? rnd(0, .7) : 0, dl: rnd(.006, .012), ph: rnd(0, 6.28), s: rnd(1, 2.1) * d * big, al: 0 });
      }
      P = P.filter(function (p) {
        p.l += p.dl * (still ? 0 : k); if (p.l >= 1) return false;
        if (p.al) {
          var e = Math.sin(p.l * Math.PI), sz = p.s * (.35 + p.l * 1.1);
          g.globalAlpha = e * .55; g.drawImage(glow(p.c), p.x - sz * 1.4, p.y - sz * 1.4, sz * 2.8, sz * 2.8);
          g.save(); g.translate(p.x, p.y); g.rotate(p.rot + p.l * .5); g.globalAlpha = e * .5; g.fillStyle = "rgb(" + p.c + ")";
          var a = sz * 1.25, b = Math.max(.5 * d, sz * .06);
          g.fillRect(-a, -b / 2, a * 2, b); g.fillRect(-b / 2, -a, b, a * 2); g.restore();
          /* a thin ring that expands and fades */
          g.globalAlpha = Math.pow(1 - p.l, 2) * .22; g.strokeStyle = "rgb(" + p.c + ")"; g.lineWidth = .8 * d;
          g.beginPath(); g.arc(p.x, p.y, sz * (.6 + p.l * 2.4), 0, 6.283); g.stroke();
        } else {
          p.ph += .08 * k; var vx = p.vx + Math.sin(p.ph) * .35 * d;
          p.x += vx * k; p.y += p.vy * k;
          var c = ramp(HEAT, p.l), fl = .75 + .25 * Math.sin(p.ph * 3.1), a2 = Math.min(1, (1 - p.l) * 1.6) * fl;
          g.globalAlpha = a2 * .35; var r = p.s * 5; g.drawImage(glow(c.join()), p.x - r, p.y - r, r * 2, r * 2);
          g.globalAlpha = a2 * .95; g.fillStyle = "rgb(" + c.join() + ")"; g.beginPath(); g.arc(p.x, p.y, p.s * (1 - p.l * .5), 0, 6.283); g.fill();
        }
        return true;
      });
      g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    });
  }

  function bigdForge(span) {
    var txt = span.textContent, sr = document.createElement("span"); sr.className = "fx-sr"; sr.textContent = txt;
    span.textContent = ""; span.classList.add("fx-split"); span.appendChild(sr);
    var order = [2, 0, 3, 1], letters = txt.split("").map(function (ch, i) {
      var l = document.createElement("span"); l.className = "fx-l"; l.setAttribute("aria-hidden", "true"); l.textContent = ch;
      l.style.setProperty("--i", i); l.style.setProperty("--j", order[i % 4]); span.appendChild(l); return l;
    });
    function lay() {
      var x0 = letters[0].offsetLeft, w = 0, h = 0;
      letters.forEach(function (l) { w = Math.max(w, l.offsetLeft - x0 + l.offsetWidth); h = Math.max(h, l.offsetHeight); });
      letters.forEach(function (l) {
        var dx = l.offsetLeft - x0;
        l.style.setProperty("--fx-w", w + "px"); l.style.setProperty("--fx-h", h + "px");
        l.style.setProperty("--fx-x", -dx + "px"); l.style.setProperty("--fx-nx", -dx + "px");
      });
    }
    lay(); if (document.fonts && document.fonts.ready) document.fonts.ready.then(lay); addEventListener("resize", lay);
    if (RM.matches) return;
    /* hero word forges in on load; the bottom one forges when it scrolls into view */
    function go() {
      span.classList.add("fx-forge");
      setTimeout(function () { span.classList.remove("fx-forge"); span.classList.add("fx-forged"); }, 200 + 120 * letters.length + 1800);
    }
    if (span.classList.contains("fx-bd-j") && "IntersectionObserver" in window) {
      letters.forEach(function (l) { l.style.opacity = "0"; });
      var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); letters.forEach(function (l) { l.style.opacity = ""; }); go(); } }, { threshold: .6 });
      io.observe(span);
    } else go();
  }

  if (V.bigd) {
    var BD = bigdTargets();
    if (V.bigd === "b" || V.bigd === "e") BD.forEach(bigdParticles);
    if (V.bigd === "d") BD.forEach(bigdForge);
  }

  /* ===================== 2. Living hero background: particles on noise-driven wind ===================== */
  /* small value noise (smooth) */
  var PERM = (function () { var p = []; for (var i = 0; i < 256; i++) p[i] = Math.random(); return p; })();
  function h2(x, y) { return PERM[(x * 73 + y * 151 + (x ^ y) * 7) & 255]; }
  function sm(t) { return t * t * (3 - 2 * t); }
  function noise2(x, y) {
    var xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi);
    var a = h2(xi & 255, yi & 255), b = h2((xi + 1) & 255, yi & 255), c = h2(xi & 255, (yi + 1) & 255), e = h2((xi + 1) & 255, (yi + 1) & 255);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + e) * xf * yf;
  }
  function Wind() {
    /* prevailing heading eases (cosine, 6–15 s) to a new direction every 20–40 s; gust fronts travel along it in waves */
    var HEAD = [0, Math.PI, -Math.PI / 4, -3 * Math.PI / 4, .3, Math.PI - .3, -Math.PI / 2 + .35, -Math.PI / 2 - .35];
    var a = pick([0, Math.PI, -Math.PI / 4, -3 * Math.PI / 4]), a0 = a, a1 = a, tc = -99, dur = 8, next = rnd(20, 34), w = { x: 0, y: 0, s: 1, a: a };
    function delta(x, y) { var d = (y - x) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return d; }
    w.at = function (t) {
      if (t > next) {
        var c, n = 0; do { c = pick(HEAD) + rnd(-.25, .25); n++; } while (Math.abs(delta(a, c)) < .9 && n < 12);
        a0 = a; a1 = a + delta(a, c); tc = t; dur = 6 + Math.abs(a1 - a0) * 3; next = t + rnd(20, 40);
      }
      var p = Math.min(1, (t - tc) / dur); a = a0 + (a1 - a0) * (.5 - .5 * Math.cos(p * Math.PI));
      w.a = a; w.x = Math.cos(a); w.y = Math.sin(a);
      w.s = .55 + .75 * noise2(t * .09, 3.7); /* slow swell of the whole wind */
      return w;
    };
    return w;
  }
  /* a field of wind-blown particles inside a rect R {x,y,w,h} (canvas px); al = Alliance motes, else Horde embers/ash.
     Used by the hero (whole canvas) and the gate (one field per half). fadeEdge = soft fade near the rect edge. */
  function Field(al, fadeEdge) {
    var P = [];
    function make(R, d, edge, w) {
      var p = { l: 0, dl: rnd(.0012, .0026), ph: rnd(0, 6.28), vx: 0, vy: 0 };
      if (edge && w) { /* enter from the upwind side */
        if (Math.abs(w.x) > Math.abs(w.y)) { p.x = w.x > 0 ? R.x - 20 * d : R.x + R.w + 20 * d; p.y = R.y + rnd(0, R.h); }
        else { p.y = w.y > 0 ? R.y - 20 * d : R.y + R.h + 20 * d; p.x = R.x + rnd(0, R.w); }
        p.l = rnd(.05, .2);
        if (fadeEdge) { p.x = R.x + rnd(0, R.w); p.y = R.y + rnd(0, R.h); p.l = 0; }
      } else { p.x = R.x + rnd(0, R.w); p.y = R.y + rnd(0, R.h); }
      if (al) {
        p.k = Math.random() < .12 ? "bokeh" : "mote"; p.s = (p.k === "bokeh" ? rnd(9, 16) : rnd(.8, 1.7)) * d;
        p.c = pick(["255,240,200", "255,226,150", "255,248,228", "246,214,130"]); p.m = rnd(.5, 1); p.lift = rnd(.005, .03) * d;
      } else {
        var r = Math.random(); p.k = r < .16 ? "ash" : (r < .42 ? "spark" : "ember");
        p.s = (p.k === "ash" ? rnd(1.4, 2.6) : rnd(1, 2.3)) * d; p.heat = rnd(0, .45); p.m = p.k === "ash" ? rnd(.7, 1.1) : rnd(.45, 1);
        p.lift = (p.k === "ash" ? rnd(.0, .03) : rnd(.05, .14)) * d; p.rot = rnd(0, 6.28); p.vr = rnd(-.05, .05);
      }
      return p;
    }
    return { reset: function () { P = []; }, step: function (g, R, d, k, t, still, w, max, gain) {
      var base = 1.15 * d, kx = 2 * Math.PI / (720 * d), om = 2 * Math.PI / 6.5, fe = (fadeEdge || 0) * d;
      if (!P.length) for (var i = 0; i < max; i++) { var q = make(R, d, false); q.l = rnd(0, .8); P.push(q); }
      while (P.length < max) P.push(make(R, d, true, w));
      if (P.length > max + 4) P.length = max;
      g.globalCompositeOperation = "lighter";
      P = P.filter(function (p) {
        p.l += p.dl * k; if (p.l >= 1) return false;
        if (!still) {
          /* gust wave travelling along the heading + local curl from noise */
          var along = p.x * w.x + p.y * w.y, gust = .5 + .5 * Math.sin(along * kx - t * om + Math.sin(t * .23) * 1.4);
          var turb = (noise2(p.x / (260 * d), p.y / (260 * d) + t * .06) - .5) * 1.5;
          var ang = w.a + turb, sp = base * w.s * (.3 + 1.05 * gust * gust);
          var tx = Math.cos(ang) * sp, ty = Math.sin(ang) * sp - p.lift * 6;
          p.vx += (tx - p.vx) * .035 * p.m * k; p.vy += (ty - p.vy) * .035 * p.m * k;
          p.ph += .05 * k; p.x += (p.vx + Math.sin(p.ph) * .12 * d) * k; p.y += (p.vy + Math.cos(p.ph * .8) * .1 * d) * k;
          if (p.rot !== undefined) p.rot += p.vr * k;
        }
        var m = fe ? 0 : 40 * d; if (p.x < R.x - m || p.x > R.x + R.w + m || p.y < R.y - m || p.y > R.y + R.h + m) return false;
        var fade = Math.min(1, p.l * 8, (1 - p.l) * 5) * gain;
        if (fe) fade *= Math.min(1, (p.x - R.x) / fe, (R.x + R.w - p.x) / fe, (p.y - R.y) / fe, (R.y + R.h - p.y) / fe);
        if (fade <= 0) return true;
        if (al) {
          var tw = .7 + .3 * Math.sin(p.ph * 2.3 + p.s);
          if (p.k === "bokeh") { g.globalAlpha = Math.min(1, fade * .07 * tw); g.drawImage(glow(p.c), p.x - p.s * 2, p.y - p.s * 2, p.s * 4, p.s * 4); }
          else {
            g.globalAlpha = Math.min(1, fade * .32 * tw); var r = p.s * 6; g.drawImage(glow(p.c), p.x - r, p.y - r, r * 2, r * 2);
            g.globalAlpha = Math.min(1, fade * .85 * tw); g.fillStyle = "rgb(" + p.c + ")"; g.beginPath(); g.arc(p.x, p.y, p.s * .7, 0, 6.283); g.fill();
          }
        } else if (p.k === "ash") {
          g.globalCompositeOperation = "source-over"; g.save(); g.translate(p.x, p.y); g.rotate(p.rot);
          g.globalAlpha = Math.min(1, fade * .35); g.fillStyle = "rgb(120,104,96)"; g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore();
          g.globalCompositeOperation = "lighter";
        } else {
          var c = ramp(HEAT, p.heat + p.l * .55).join(), fl = .7 + .3 * Math.sin(p.ph * 4.3 + p.s * 3);
          var a = fade * fl;
          g.globalAlpha = Math.min(1, a * .34); var rr = p.s * 6; g.drawImage(glow(c), p.x - rr, p.y - rr, rr * 2, rr * 2);
          g.globalAlpha = Math.min(1, a * .9);
          if (p.k === "spark") { /* short streak along its motion: shows the wind */
            g.strokeStyle = "rgb(" + c + ")"; g.lineWidth = p.s * .9; g.lineCap = "round";
            g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * 5, p.y - p.vy * 5); g.stroke();
          } else { g.fillStyle = "rgb(" + c + ")"; g.beginPath(); g.arc(p.x, p.y, p.s * .75, 0, 6.283); g.fill(); }
        }
        return true;
      });
      g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    } };
  }
  function heroParticles() {
    var hero = document.querySelector(".hero"); if (!hero) return;
    var cv = document.createElement("canvas"); cv.className = "fx-hero-cv"; cv.setAttribute("aria-hidden", "true");
    hero.insertBefore(cv, hero.firstChild);
    var wind = Wind(), F = null, FT = null, lastSide = "", h1 = hero.querySelector("h1");
    loop(cv, hero, function (g, W, Hh, d, k, t, still) {
      var sd = side(); if (sd !== lastSide) { F = Field(sd === "alliance"); FT = Field(sd === "alliance", 60); lastSide = sd; }
      var max = Math.min(small() ? 45 : 110, Math.round(W * Hh / (d * d) / (sd === "alliance" ? 11000 : 8500)));
      g.clearRect(0, 0, W, Hh);
      // Dejan 10 Nov (card 39): 70 % of the particles gather round the "BigD or Go Home" title, 30 % drift over the rest (the clips stay clean)
      var T = null;
      if (h1) { var hr = hero.getBoundingClientRect(), r = h1.getBoundingClientRect(), cw = cv.width / Math.max(1, hr.width);
        T = { x: Math.max(0, (r.left - hr.left - 70) * cw), y: Math.max(0, (r.top - hr.top - 60) * cw), w: (r.width + 140) * cw, h: (r.height + 120) * cw }; }
      if (T) { FT.step(g, T, d, k, t, still, wind.at(t), Math.round(max * .7), 1); F.step(g, { x: 0, y: 0, w: W, h: Hh }, d, k, t, still, wind.at(t), Math.round(max * .3), 1); }
      else F.step(g, { x: 0, y: 0, w: W, h: Hh }, d, k, t, still, wind.at(t), max, 1);
    });
  }
  if (V.heroparticles) heroParticles();
  /* option b: centre the ray burst on the emblem (the ::after box is the hero grown by 40 % on each side) */
  if (V.heroparticles === "b") (function () {
    var hero = document.querySelector(".hero"), em = hero && hero.querySelector(".emblem"); if (!em) return;
    function c() {
      var h = hero.getBoundingClientRect(), e = em.getBoundingClientRect(); if (!h.width || !e.width) return;
      hero.style.setProperty("--fx-rx", ((e.left + e.width / 2 - h.left + .4 * h.width) / (1.8 * h.width) * 100).toFixed(2) + "%");
      hero.style.setProperty("--fx-ry", ((e.top + e.height / 2 - h.top + .4 * h.height) / (1.8 * h.height) * 100).toFixed(2) + "%");
    }
    c(); addEventListener("resize", c); addEventListener("load", c); if (document.fonts && document.fonts.ready) document.fonts.ready.then(c);
  })();


  /* ===================== 6. Pick-your-side gate: the screen breathes (motes over Alliance, embers/ash over Horde) ===================== */
  function gateParticles(gate) {
    if (gate.querySelector(".fx-gate-cv")) return;
    var A = gate.querySelector(".fx-half.fx-alliance"), Hd = gate.querySelector(".fx-half.fx-horde"); if (!A || !Hd) return;
    var cv = document.createElement("canvas"); cv.className = "fx-gate-cv"; cv.setAttribute("aria-hidden", "true");
    gate.insertBefore(cv, gate.firstChild);
    var wind = Wind(), FA = Field(true, 70), FH = Field(false, 70), hov = "", gA = 1, gH = 1;
    [A, Hd].forEach(function (b) {
      var s = b === A ? "alliance" : "horde";
      b.addEventListener("pointerenter", function (e) { if (e.pointerType !== "touch") hov = s; });
      b.addEventListener("pointerleave", function () { if (hov === s) hov = ""; });
      b.addEventListener("focus", function () { if (b.matches(":focus-visible")) hov = s; });
      b.addEventListener("blur", function () { if (hov === s) hov = ""; });
    });
    loop(cv, gate, function (g, W, Hh, d, k, t, still) {
      var c = cv.getBoundingClientRect(), a = A.getBoundingClientRect(), h = Hd.getBoundingClientRect(), RA, RH;
      if (a.right <= h.left + 2) { /* side by side: split at the gap between the halves */
        var sx = Math.round(((a.right + h.left) / 2 - c.left) * d); RA = { x: 0, y: 0, w: sx, h: Hh }; RH = { x: sx, y: 0, w: W - sx, h: Hh };
      } else { /* stacked (phones) */
        var sy = Math.round(((a.bottom + h.top) / 2 - c.top) * d); RA = { x: 0, y: 0, w: W, h: sy }; RH = { x: 0, y: sy, w: W, h: Hh - sy };
      }
      /* a bit stronger near the hovered half, calmer on the other; after the pick only the chosen side keeps going */
      var ch = gate.classList.contains("fx-chose-alliance") ? "alliance" : gate.classList.contains("fx-chose-horde") ? "horde" : "";
      var on = ch || hov, tA = on ? (on === "alliance" ? (ch ? 1.9 : 1.6) : (ch ? 0 : .45)) : 1.15, tH = on ? (on === "horde" ? (ch ? 1.9 : 1.6) : (ch ? 0 : .45)) : 1.15;
      var e = still ? 1 : Math.min(1, .05 * k); gA += (tA - gA) * e; gH += (tH - gH) * e;
      var per = function (R) { return Math.min(small() ? 26 : 60, Math.round(R.w * R.h / (d * d) / 9000)); };
      var w = wind.at(t);
      g.clearRect(0, 0, W, Hh);
      FA.step(g, RA, d, k, t, still, w, Math.round(per(RA) * (gA > 1.2 ? 1.25 : 1)), gA);
      FH.step(g, RH, d, k, t, still, w, Math.round(per(RH) * (gH > 1.2 ? 1.25 : 1)), gH);
    });
  }
  if (V.gate) (function () {
    var g = document.querySelector(".fx-gate"); if (g) return gateParticles(g);
    var mo = new MutationObserver(function () { var x = document.querySelector(".fx-gate"); if (x) { mo.disconnect(); gateParticles(x); } });
    mo.observe(document.body || document.documentElement, { childList: true });
    setTimeout(function () { mo.disconnect(); }, 8000);
  })();

  /* ===================== 3/4. brand icons ===================== */
  var NS = "http://www.w3.org/2000/svg";
  var ICONS = {
    discord: '<path d="M20.32 4.37a19.8 19.8 0 0 0-4.89-1.52.07.07 0 0 0-.08.04c-.21.38-.44.86-.61 1.25a18.27 18.27 0 0 0-5.49 0 12.64 12.64 0 0 0-.62-1.25.08.08 0 0 0-.08-.04 19.74 19.74 0 0 0-4.88 1.52.07.07 0 0 0-.03.03C.53 9.05-.32 13.58.1 18.06a.08.08 0 0 0 .03.06 19.9 19.9 0 0 0 5.99 3.03.08.08 0 0 0 .08-.03c.46-.63.87-1.3 1.23-1.99a.08.08 0 0 0-.04-.11 13.1 13.1 0 0 1-1.87-.89.08.08 0 0 1-.01-.13c.13-.09.25-.19.37-.29a.07.07 0 0 1 .08-.01c3.93 1.79 8.18 1.79 12.06 0a.07.07 0 0 1 .08.01c.12.1.25.2.37.29a.08.08 0 0 1-.01.13c-.6.35-1.22.65-1.87.89a.08.08 0 0 0-.04.11c.36.7.77 1.36 1.23 1.99a.08.08 0 0 0 .08.03 19.84 19.84 0 0 0 6-3.03.08.08 0 0 0 .03-.06c.5-5.18-.84-9.67-3.55-13.66a.06.06 0 0 0-.03-.03zM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.96-2.42 2.16-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.42-2.16 2.42zm7.97 0c-1.18 0-2.15-1.09-2.15-2.42s.95-2.42 2.15-2.42c1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.42-2.16 2.42z"/>',
    youtube: '<path fill-rule="evenodd" d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12z"/>',
    tiktok: '<path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',
    kofi: '<path fill-rule="evenodd" d="M2.5 6.5h15v6.8a5.2 5.2 0 0 1-5.2 5.2H7.7a5.2 5.2 0 0 1-5.2-5.2zm7.5 9.1 2.85-2.75a1.75 1.75 0 0 0-2.5-2.45l-.35.35-.35-.35a1.75 1.75 0 0 0-2.5 2.45z"/><path d="M17.5 8.4h1.2a3.1 3.1 0 0 1 0 6.2h-1.4" fill="none" stroke="currentColor" stroke-width="2.1"/><rect x="2" y="19.6" width="16" height="1.9" rx=".95"/>',
    brag: '<path d="M21.6 2.4C14.5 3 8.6 7.3 6.5 14.6l-.55 1.9 1.25.37.5-1.62c1.9.02 3.7-.47 5.2-1.45l-2.6-.55 3.95-.95c1-.85 1.85-1.9 2.5-3.1l-2.3-.2 3.1-1.4c.9-1.6 1.5-3.4 1.95-5.2z"/><path d="M6.4 16.9 4.6 22.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    reddit: '<path fill-rule="evenodd" d="M12 8.2c4.4 0 8 2.5 8 5.7s-3.6 5.7-8 5.7-8-2.5-8-5.7 3.6-5.7 8-5.7zm-3 4.2a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm6 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z"/><circle cx="18.2" cy="4.4" r="1.6"/><path d="M12 8.4 13.4 3.6l4.4 1" fill="none" stroke="currentColor" stroke-width="1.3"/><circle cx="4.5" cy="10.8" r="1.9"/><circle cx="19.5" cy="10.8" r="1.9"/>'
  };
  function icon(kind) {
    var s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true"); s.setAttribute("focusable", "false");
    s.setAttribute("class", "fx-ico fx-ico-" + kind); s.innerHTML = ICONS[kind]; return s;
  }
  function kindOf(a) {
    var h = (a.getAttribute("href") || "").toLowerCase(), t = (a.textContent || "").toLowerCase();
    if (/discord/.test(h + t)) return "discord";
    if (/youtu/.test(h + t)) return "youtube";
    if (/tiktok/.test(h + t)) return "tiktok";
    if (/ko-?fi|war chest/.test(h + t)) return "kofi";
    if (/reddit/.test(h + t)) return "reddit";
    if (/tally|brag/.test(h + t)) return "brag";
    return "";
  }
  function decorate(a) {
    if (a.querySelector(".fx-ico")) return;
    var k = kindOf(a); if (!k) return;
    a.setAttribute("data-fx", k); a.insertBefore(icon(k), a.firstChild);
  }
  if (V.socials) {
    var links = document.getElementById("links");
    if (links) {
      var all = function () { [].forEach.call(links.querySelectorAll("a"), decorate); };
      all(); new MutationObserver(all).observe(links, { childList: true });
    }
  }

  /* ===================== 4. Submit a brag as the main hero button + sparks ===================== */
  if (V.submitfx) (function () {
    var sub = document.getElementById("cta-submit"), dc = document.getElementById("cta-discord"); if (!sub) return;
    sub.classList.remove("ghost"); if (dc) { dc.classList.add("ghost"); decorate(dc); }
    var cv = document.createElement("canvas"); cv.className = "fx-sub-cv"; cv.setAttribute("aria-hidden", "true"); sub.insertBefore(cv, sub.firstChild);
    var P = [], hot = 0;
    sub.addEventListener("pointerenter", function () { hot = 1; }); sub.addEventListener("pointerleave", function () { hot = 0; });
    sub.addEventListener("focus", function () { hot = 1; }); sub.addEventListener("blur", function () { hot = 0; });
    var PADX = 56, PADY = 46;
    loop(cv, sub, function (g, W, Hh, d, k, t, still) {
      g.clearRect(0, 0, W, Hh); if (still) return;
      var al = side() === "alliance", bx = PADX * d, by = PADY * d, bw = W - 2 * bx, bh = Hh - 2 * by;
      var rate = (hot ? .6 : .28) * k, max = small() ? 18 : 34;
      if (P.length < max && Math.random() < rate) {
        /* a point on the button edge, moving outward and slightly up */
        var per = 2 * (bw + bh), u = Math.random() * per, x, y, nx = 0, ny = 0;
        if (u < bw) { x = bx + u; y = by; ny = -1; } else if (u < bw + bh) { x = bx + bw; y = by + u - bw; nx = 1; }
        else if (u < 2 * bw + bh) { x = bx + (u - bw - bh); y = by + bh; ny = 1; } else { x = bx; y = by + (u - 2 * bw - bh); nx = -1; }
        var sp = rnd(.15, .5) * d;
        P.push({ x: x, y: y, vx: nx * sp + rnd(-.15, .15) * d, vy: ny * sp * .6 - rnd(.15, .4) * d, l: 0, dl: rnd(.011, .02), s: rnd(.9, 1.8) * d, ph: rnd(0, 6.28) });
      }
      g.globalCompositeOperation = "lighter";
      P = P.filter(function (p) {
        p.l += p.dl * k; if (p.l >= 1) return false;
        p.ph += .12 * k; p.vy -= .004 * d * k; p.x += (p.vx + Math.sin(p.ph) * .12 * d) * k; p.y += p.vy * k;
        var a = Math.min(1, p.l * 6) * (1 - p.l), c = al ? ramp([[255, 250, 230], [255, 226, 150], [233, 190, 92]], p.l).join() : ramp(HEAT, .1 + p.l * .8).join();
        g.globalAlpha = a * .4; var r = p.s * 5; g.drawImage(glow(c), p.x - r, p.y - r, r * 2, r * 2);
        g.globalAlpha = a; g.fillStyle = "rgb(" + c + ")"; g.beginPath(); g.arc(p.x, p.y, p.s * (1 - p.l * .4), 0, 6.283); g.fill();
        return true;
      });
      g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
    });
  })();

  /* ===================== 5. Tiles / cards: Talentsmith's faction-pick burst, as a hover fade ===================== */
  if (V.tilehover && !RM.matches) (function () {
    var SEL = ".war-links .wl, .chaos .tile, #feed .card";
    var cv = document.createElement("canvas"); cv.className = "fx-tile-cv"; cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    var g = cv.getContext("2d"), d = 1, P = [], F = [], raf = 0, last = 0, lastHit = new WeakMap();
    var EM = ["ember1", "ember2", "ember3", "ember4"];
    function size() { d = DPR(); var w = Math.round(innerWidth * d), h = Math.round(innerHeight * d); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; } }
    size(); addEventListener("resize", size);
    function burst(el, cx, cy) {
      var r = el.getBoundingClientRect(), al = side() === "alliance", sx = scrollX, sy = scrollY;
      if (cx == null) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
      cx = Math.max(r.left + 8, Math.min(r.right - 8, cx)); cy = Math.max(r.top + 8, Math.min(r.bottom - 8, cy));
      F.push({ x: cx + sx, y: cy + sy, l: 0, al: al, s: Math.min(220, Math.max(r.width, r.height) * .55), rot: rnd(0, 6.28) });
      var n = small() ? 10 : 22;
      for (var i = 0; i < n; i++) {
        var a = al ? rnd(0, 6.283) : rnd(-2.75, -.4), sp = rnd(1.2, al ? 3.4 : 4.2), spr = !al && Math.random() < .45;
        P.push({ x: cx + sx, y: cy + sy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * (al ? .75 : 1), l: 0, dl: rnd(.022, .036), al: al,
          s: spr ? rnd(9, 15) : rnd(1, 2.1), img: spr ? pick(EM) : null, c: al ? pick(["255,232,165", "255,246,214", "246,206,110"]) : ramp(HEAT, rnd(0, .45)).join() });
      }
      if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    }
    function frame(ts) {
      raf = 0; if (document.hidden) { P = []; F = []; g.clearRect(0, 0, cv.width, cv.height); return; }
      var dt = last ? ts - last : 16; last = ts; var k = Math.min(3, dt / 16.67), ox = scrollX, oy = scrollY;
      g.clearRect(0, 0, cv.width, cv.height); g.globalCompositeOperation = "lighter";
      F = F.filter(function (f) {
        f.l += .03 * k; if (f.l >= 1) return false;
        var e = f.l, a = e < .18 ? e / .18 : Math.pow(1 - (e - .18) / .82, 1.6), s = f.s * (.5 + e * .9) * d, x = (f.x - ox) * d, y = (f.y - oy) * d;
        g.globalAlpha = a * (f.al ? .22 : .2); g.drawImage(glow(f.al ? "255,214,120" : "255,120,40"), x - s / 2, y - s / 2, s, s);
        if (f.al) { var im = img("sp-glitter-small"); if (ok(im)) { var s2 = s * .7; g.save(); g.translate(x, y); g.rotate(f.rot + e * .5); g.globalAlpha = a * .45; g.drawImage(im, -s2 / 2, -s2 / 2, s2, s2); g.restore(); } }
        return true;
      });
      P = P.filter(function (p) {
        p.l += p.dl * k; if (p.l >= 1) return false;
        var fr = Math.pow(p.al ? .93 : .95, k); p.vx *= fr; p.vy = p.vy * fr - (p.al ? .02 : .04) * k;
        p.x += p.vx * k; p.y += p.vy * k;
        var x = (p.x - ox) * d, y = (p.y - oy) * d, a = Math.min(1, (1 - p.l) * 1.3);
        var im = p.img && img(p.img);
        if (im && ok(im)) {
          var w = p.s * d, h = w * im.naturalHeight / im.naturalWidth;
          g.save(); g.translate(x, y); g.rotate(Math.atan2(p.vy, p.vx) + Math.PI * .75); g.globalAlpha = a * .85; g.drawImage(im, -w / 2, -h / 2, w, h); g.restore();
        } else {
          var r = p.s * d * 4; g.globalAlpha = a * .35; g.drawImage(glow(p.c), x - r, y - r, r * 2, r * 2);
          g.globalAlpha = a; g.fillStyle = "rgb(" + p.c + ")"; g.beginPath(); g.arc(x, y, p.s * d * (1 - p.l * .4), 0, 6.283); g.fill();
        }
        return true;
      });
      g.globalAlpha = 1; g.globalCompositeOperation = "source-over";
      if (P.length || F.length) raf = requestAnimationFrame(frame); else g.clearRect(0, 0, cv.width, cv.height);
    }
    EM.forEach(img); img("sp-glitter-small");
    document.addEventListener("pointerover", function (e) {
      if (e.pointerType === "touch") return;
      var el = e.target.closest && e.target.closest(SEL); if (!el) return;
      if (e.relatedTarget && el.contains(e.relatedTarget)) return; /* moving inside the same tile */
      var now = performance.now(); if (now - (lastHit.get(el) || 0) < 450) return; lastHit.set(el, now);
      burst(el, e.clientX, e.clientY);
    });
    document.addEventListener("focusin", function (e) { var el = e.target.closest && e.target.closest(SEL); if (el && el.matches(":focus-visible")) burst(el); });
  })();
})();
