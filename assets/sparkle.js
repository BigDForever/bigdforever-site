/* Emblem sparkles (Dejan 18 Nov: Red 1 Comet + Gold 3 Ribbon, intensity 48%).
   A red comet plays on the red outer line, a gold ribbon spark on the inner gold ring of the hero emblem.
   Canvas sits over the <img class="emblem">; nothing else on the page changes. Off for reduced motion. */
(function () {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  /* ?spark=1|2|3 previews size/brightness options on the live site (0 = current). */
  var V = 0; try { V = +(new URLSearchParams(location.search).get("spark") || 0); } catch (e) {}
  var INT = [0.48, 0.48, 0.75, 1][V] || 0.48, TAU = Math.PI * 2, M = 46, K = 1, BOLD = V === 3;
  function rnd(a, b) { return a + Math.random() * (b - a); }

  function start() {
    var em = document.querySelector(".hero .emblem"); if (!em || !em.parentNode) return;
    var cv = document.createElement("canvas"); cv.className = "emblem-sparkle"; cv.setAttribute("aria-hidden", "true");
    cv.style.cssText = "position:absolute;pointer-events:none;z-index:2";
    em.parentNode.appendChild(cv);
    var ctx = cv.getContext("2d"), geo = {}, visible = true, running = false, last = 0;

    function place() {
      var s = em.offsetWidth; if (!s) return;
      K = V ? s / 220 : 1; M = Math.round(46 * K);
      var W = s + 2 * M, d = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.round(W * d); cv.height = Math.round(W * d); cv.style.width = W + "px"; cv.style.height = W + "px";
      cv.style.left = (em.offsetLeft - M) + "px"; cv.style.top = (em.offsetTop - M) + "px";
      ctx.setTransform(d, 0, 0, d, 0, 0);
      geo = { W: W, c: W / 2, r: s / 2, rRed: s / 2 + 7, rGold: s / 2 * 0.892 };
    }

    /* playful mover: cruises, slows almost to a stop, reverses, dashes */
    function Mover(base, moods) { this.th = Math.random() * TAU; this.dir = Math.random() < .5 ? 1 : -1; this.base = base; this.w = base * this.dir; this.tw = this.w; this.t = 0; this.moods = moods; this.hist = []; }
    Mover.prototype.next = function () {
      var tot = 0, k, x, m = "cruise", b = this.base; for (k in this.moods) tot += this.moods[k];
      x = Math.random() * tot; for (k in this.moods) { x -= this.moods[k]; if (x <= 0) { m = k; break; } }
      if (m === "cruise") { this.tw = this.dir * b * rnd(.7, 1.3); this.t = rnd(1.2, 3); }
      if (m === "slow") { this.tw = this.dir * b * rnd(.04, .15); this.t = rnd(.6, 1.4); }
      if (m === "reverse") { this.dir *= -1; this.tw = this.dir * b * rnd(.8, 1.2); this.t = rnd(1, 2.2); }
      if (m === "dash") { this.tw = this.dir * b * rnd(2.2, 3.2); this.t = rnd(.35, .8); }
    };
    Mover.prototype.step = function (dt) { this.t -= dt; if (this.t <= 0) this.next(); this.w += (this.tw - this.w) * Math.min(1, dt * 4); this.th += this.w * dt; this.push(); };
    Mover.prototype.push = function () { this.hist.push(this.th); if (this.hist.length > 260) this.hist.shift(); };

    var red = new Mover(1.1, { cruise: 5, slow: 1.5, reverse: 1.5, dash: 1 });
    var gold = new Mover(.9, {}), g3 = { phase: 0, lap: 0, center: Math.random() * TAU };
    var GOLD = ["255,200,90", "255,245,200"], sparks = [];
    function drawSparks(dt) { var c = redCol()[0]; for (var i = sparks.length - 1; i >= 0; i--) { var p = sparks[i]; p.age += dt; var k = 1 - p.age / p.life; if (k <= 0) { sparks.splice(i, 1); continue; } p.r += p.vr * dt; p.th += p.vt * dt; var q = P(p.r, p.th); glow(q[0], q[1], (2 + 2.5 * k) * K, c, .9 * k); } }

    function P(r, th) { return [geo.c + r * Math.cos(th), geo.c + r * Math.sin(th)]; }
    function glow(x, y, rad, col, a) { var g = ctx.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, "rgba(" + col + "," + a + ")"); g.addColorStop(.35, "rgba(" + col + "," + a * .45 + ")"); g.addColorStop(1, "rgba(" + col + ",0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, rad, 0, TAU); ctx.fill(); }
    /* the outer line is gold on the Alliance site, so the comet turns pale blue there */
    function redCol() { return document.documentElement.getAttribute("data-side") === "alliance" ? ["130,175,255", "220,235,255"] : ["255,70,40", "255,190,120"]; }

    function comet(m) {
      var cc = redCol(), c = cc[0], n = Math.round(70 + 170 * INT), s0 = Math.max(1, m.hist.length - n), i, f, a, b;
      ctx.lineCap = "round";
      for (i = s0; i < m.hist.length; i++) {
        f = (i - (m.hist.length - n)) / n; a = P(geo.rRed, m.hist[i - 1]); b = P(geo.rRed, m.hist[i]);
        ctx.strokeStyle = "rgba(" + c + "," + (.12 + .75 * f * Math.min(1, INT * 1.3)) + ")"; ctx.lineWidth = (1.5 + 6 * f * INT) * K;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        if (V ? i % 2 === 0 : i % 3 === 0) glow(b[0], b[1], (3 + 8 * f * INT) * K, c, (.05 + .35 * f * f * INT) * (V ? .55 : 1));
      }
      a = P(geo.rRed, m.th); glow(a[0], a[1], (10 + 14 * INT) * K, c, .9 * Math.min(1, INT * 1.4)); glow(a[0], a[1], (3 + 3 * INT) * K, cc[1], 1);
      if (BOLD) { glow(a[0], a[1], 34 * K, c, .25); if (Math.random() < .6) sparks.push({ th: m.th, r: geo.rRed, vr: (Math.random() < .7 ? 1 : -1) * rnd(4, 16) * K, vt: -m.w * rnd(.03, .2), life: rnd(.5, 1.1), age: 0 }); }
    }
    function ribbon(m, dt) { /* swings back and forth like it's playing, sometimes breaks into a full lap */
      if (g3.lap > 0) { g3.lap -= dt; m.th += m.dir * 2.6 * dt; if (g3.lap <= 0) { g3.center = m.th; g3.phase = 0; } }
      else { g3.phase += dt * rnd(1.6, 2.2); m.th = g3.center + .9 * Math.sin(g3.phase) * (.6 + .4 * Math.sin(g3.phase * .37)); if (Math.random() < dt * .18) { g3.lap = rnd(1.8, 2.6); m.dir = Math.random() < .5 ? 1 : -1; } }
      m.push();
      var n = Math.round(8 + 22 * INT), i, f, a, b; ctx.lineCap = "round";
      for (i = Math.max(1, m.hist.length - n); i < m.hist.length; i++) {
        f = (i - (m.hist.length - n)) / n; a = P(geo.rGold, m.hist[i - 1]); b = P(geo.rGold, m.hist[i]);
        ctx.strokeStyle = "rgba(" + GOLD[0] + "," + (.7 * f * INT + .05) + ")"; ctx.lineWidth = (1 + 4 * f * INT) * K;
        ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      }
      a = P(geo.rGold, m.th); glow(a[0], a[1], (7 + 10 * INT) * K, GOLD[0], .85 * Math.min(1, INT * 1.5)); glow(a[0], a[1], (2.5 + 2 * INT) * K, GOLD[1], 1);
      if (BOLD) glow(a[0], a[1], 26 * K, GOLD[0], .22);
    }

    function frame(now) {
      if (!visible || document.hidden) { running = false; return; }
      var dt = Math.min(.05, (now - last) / 1000); last = now;
      if (geo.W) {
        ctx.clearRect(0, 0, geo.W, geo.W); ctx.globalCompositeOperation = "lighter";
        red.step(dt); comet(red); ribbon(gold, dt); drawSparks(dt);
        ctx.globalCompositeOperation = "source-over";
      }
      requestAnimationFrame(frame);
    }
    function go() { if (running || !visible || document.hidden) return; running = true; last = performance.now(); requestAnimationFrame(frame); }

    place();
    if (em.complete) place(); else em.addEventListener("load", place);
    addEventListener("resize", place); addEventListener("load", place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    if (window.ResizeObserver) new ResizeObserver(place).observe(em);
    if (window.IntersectionObserver) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; go(); }).observe(em);
    document.addEventListener("visibilitychange", go);
    go();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
