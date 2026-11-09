/* BigD effects kit. Options: btn, heading, corners, hover, ambient, emblem, ticker. Preview with ?fx=btn,corners or ?fx=all;
   without ?fx the options in window.BIGD_FX_ON (set by the page) are used, else none.
   Builds the effect pieces as absolutely placed spans; looks change with html[data-side]. */
(function () {
  const ALL = ["btn", "heading", "corners", "hover", "ambient", "emblem", "ticker"];
  let opt = new URLSearchParams(location.search).get("fx");
  opt = opt === "all" ? ALL : opt === null ? (window.BIGD_FX_ON || []) : opt.split(",").filter(Boolean);
  const html = document.documentElement;
  html.setAttribute("data-fx", opt.join(" "));
  const on = k => opt.includes(k);
  const side = () => html.getAttribute("data-side") === "alliance" ? "a" : "h";
  const P = (cls, css) => { const s = document.createElement("span"); s.className = "bfx-p " + cls;
    Object.entries(css || {}).forEach(([k, v]) => k.startsWith("--") ? s.style.setProperty(k, v) : (s.style[k] = v)); return s; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const built = [];
  const clear = () => { built.forEach(f => f()); built.length = 0; };

  function btn() {
    document.querySelectorAll(".btn.cta-main, #chaos-submit").forEach(b => {
      b.classList.add("bfx-btn");
      const add = el => { b.append(el); built.push(() => el.remove()); };
      if (side() === "a") {
        const c = document.createElement("span"); c.className = "bfx-clip"; c.append(P("bfx-shine")); add(c);
        add(P("bfx-star", { top: "-22px", right: "-18px", animationDelay: "0s", animationDuration: "3.6s" }));
        add(P("bfx-star s", { bottom: "-12px", left: "-10px", animationDelay: "1.8s", animationDuration: "3.6s" }));
      } else {
        [["s", "14%"], ["m", "48%"], ["s", "80%"]].forEach(([k, x], i) =>
          add(P("bfx-flame " + k + " bfx-under", { left: x, top: "-30px", width: "26px", height: "42px", opacity: ".85", animationDelay: (i * .31) + "s" })));
        for (let i = 0; i < 5; i++)
          add(P("bfx-ember", { left: rnd(5, 92) + "%", top: rnd(-10, 20) + "px", backgroundImage: "url(assets/fx/ember-" + (i % 8) + ".png)",
            animationDelay: rnd(0, 2.6) + "s", "--dx": rnd(-25, 25) + "px", "--dy": rnd(-120, -70) + "px" }));
      }
    });
  }
  function heading() {
    document.querySelectorAll(".sec h2, .join h2").forEach((h, i) => {
      const s = document.createElement("span"); s.className = "bfx-h";
      s.append(side() === "a" ? P("bfx-star", { animationDelay: (i * .4) + "s" }) : P("bfx-flame " + ["s", "m"][i % 2], { animationDelay: (i * .2) + "s" }));
      h.prepend(s); built.push(() => s.remove());
    });
  }
  function corners() {
    document.querySelectorAll(".card, .ch, .tile, .rule, .empty").forEach(el => {
      el.classList.add("bfx-c");
      ["tl", "tr", "bl", "br"].forEach(k => { const c = document.createElement("span"); c.className = "bfx-k " + k; el.append(c); built.push(() => c.remove()); });
    });
  }
  function hover() {
    document.querySelectorAll(".card, .tile, .ch").forEach(el => {
      el.classList.add("bfx-hv");
      const c = document.createElement("span"); c.className = "bfx-hvclip"; c.append(P("bfx-shine"));
      const cl = document.createElement("span"); cl.className = "bfx-claws"; cl.innerHTML = "<i></i><i></i><i></i>"; c.append(cl);
      el.append(c); built.push(() => c.remove());
    });
  }
  function ambient() {
    const hero = document.querySelector(".hero"); if (!hero) return;
    const box = document.createElement("div"); box.className = "bfx-amb";
    if (side() === "a") {
      for (let i = 0; i < 9; i++) { const s = rnd(16, 40);
        box.append(P("bfx-mote", { left: rnd(2, 96) + "%", top: rnd(30, 95) + "%", width: s + "px", height: s + "px", backgroundImage: "url(assets/fx/mote-" + (i % 6) + ".png)",
          animationDelay: -rnd(0, 9) + "s", animationDuration: rnd(7, 12) + "s", "--dx": rnd(-40, 40) + "px" })); }
      for (let i = 0; i < 3; i++) box.append(P("bfx-star s", { left: rnd(4, 60) + "%", top: rnd(8, 85) + "%", animationDelay: rnd(0, 3) + "s", animationDuration: rnd(2.5, 4) + "s" }));
    } else {
      for (let i = 0; i < 12; i++) box.append(P("bfx-ember", { left: rnd(0, 100) + "%", top: rnd(55, 100) + "%", backgroundImage: "url(assets/fx/ember-" + (i % 8) + ".png)",
        animationDelay: -rnd(0, 5) + "s", animationDuration: rnd(4, 7) + "s", "--dx": rnd(-60, 60) + "px", "--dy": -rnd(180, 380) + "px" }));
      for (let i = 0; i < 2; i++) box.append(P("bfx-smoke", { left: rnd(0, 90) + "%", bottom: "-40px", backgroundImage: "url(assets/fx/smoke-" + (i % 2) + ".png)", animationDelay: -rnd(0, 8) + "s" }));
    }
    hero.prepend(box); built.push(() => box.remove());
  }
  function emblem() {
    const em = document.querySelector(".hero .emblem"); if (!em) return;
    const w = document.createElement("div"); w.className = "bfx-em"; em.before(w); w.append(em);
    const add = el => w.append(el);
    if (side() === "a") {
      [["", "4%", "8%", 0], ["s", "84%", "14%", 1.3], ["s", "88%", "72%", 2.4]].forEach(([k, x, y, d]) =>
        add(P("bfx-star " + k, { left: x, top: y, animationDelay: d + "s", animationDuration: "3.2s" })));
    } else {
      [["m", "16%"], ["l", "42%"], ["m", "68%"]].forEach(([k, x], i) =>
        add(P("bfx-flame " + k + " bfx-under", { left: x, bottom: "-12%", width: "104px", height: "168px", animationDelay: (i * .23) + "s" })));
      for (let i = 0; i < 6; i++) add(P("bfx-ember", { left: rnd(10, 90) + "%", top: rnd(55, 95) + "%", width: "20px", height: "20px", backgroundImage: "url(assets/fx/ember-" + (i % 8) + ".png)",
        animationDelay: -rnd(0, 3) + "s", animationDuration: rnd(2.2, 3.5) + "s", "--dx": rnd(-40, 40) + "px", "--dy": -rnd(160, 300) + "px" }));
    }
    built.push(() => { w.before(em); w.remove(); });
  }
  let build = function () {
    clear();
    const F = { btn, heading, corners, hover, ambient, emblem };
    Object.keys(F).forEach(k => on(k) && F[k]());
    document.querySelectorAll("#feed .card").forEach(c => c.setAttribute("data-bfx", ""));   // seen: stops the feed watcher re-running
  };
  const go = () => { build(); new MutationObserver(m => { if (m.some(x => x.attributeName === "data-side")) build(); }).observe(html, { attributes: true }); };
  // the brag feed renders later from the sheet: re-run corners/hover once it lands
  const feed = document.getElementById("feed");
  if (feed) new MutationObserver(() => { if (feed.querySelector(".card:not([data-bfx])")) build(); }).observe(feed, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
  // pause everything in a background tab, and each effect host while it is off-screen
  document.addEventListener("visibilitychange", () => html.classList.toggle("bfx-off", document.hidden));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle("bfx-idle", !e.isIntersecting)));
    const watch = () => document.querySelectorAll(".bfx-btn, .bfx-h, .bfx-c, .bfx-hv, .hero, .bfx-em").forEach(el => io.observe(el));
    const b0 = build; build = function () { b0(); watch(); };
  }
  window.BIGD_FX = { build, ALL };
})();
