/* BigD effects kit (demo). ?fx=btn,heading,corners,hover,ambient,emblem,ticker or ?fx=all (default all on this branch).
   Builds the effect pieces as absolutely placed spans; looks change with html[data-side]. */
(function () {
  const ALL = ["btn", "heading", "corners", "hover", "ambient", "emblem", "ticker"];
  let opt = new URLSearchParams(location.search).get("fx");
  opt = (opt === null || opt === "all") ? ALL : opt.split(",").filter(Boolean);
  const html = document.documentElement;
  html.setAttribute("data-fx", opt.join(" "));
  const on = k => opt.includes(k);
  const side = () => html.getAttribute("data-side") === "alliance" ? "a" : "h";
  const P = (cls, css) => { const s = document.createElement("span"); s.className = "fx-p " + cls;
    Object.entries(css || {}).forEach(([k, v]) => k.startsWith("--") ? s.style.setProperty(k, v) : (s.style[k] = v)); return s; };
  const rnd = (a, b) => a + Math.random() * (b - a);
  const built = [];
  const clear = () => { built.forEach(f => f()); built.length = 0; };

  function btn() {
    document.querySelectorAll(".btn.cta-main, #chaos-submit").forEach(b => {
      b.classList.add("fx-btn");
      const add = el => { b.append(el); built.push(() => el.remove()); };
      if (side() === "a") {
        const c = document.createElement("span"); c.className = "fx-clip"; c.append(P("fx-shine")); add(c);
        add(P("fx-star l", { top: "-30px", right: "-26px", animationDelay: "0s" }));
        add(P("fx-star", { bottom: "-16px", left: "-14px", animationDelay: "1.2s" }));
        add(P("fx-star s", { top: "-12px", left: "38%", animationDelay: ".6s" }));
      } else {
        [["s", "8%"], ["l", "30%"], ["m", "56%"], ["s", "80%"]].forEach(([k, x], i) =>
          add(P("fx-flame " + k + " fx-under", { left: x, top: "-40px", width: k === "l" ? "40px" : "32px", height: k === "l" ? "64px" : "52px", animationDelay: (i * .27) + "s" })));
        for (let i = 0; i < 9; i++)
          add(P("fx-ember", { left: rnd(5, 92) + "%", top: rnd(-10, 20) + "px", backgroundImage: "url(assets/fx/ember-" + (i % 8) + ".png)",
            animationDelay: rnd(0, 2.6) + "s", "--dx": rnd(-25, 25) + "px", "--dy": rnd(-120, -70) + "px" }));
      }
    });
  }
  function heading() {
    document.querySelectorAll(".sec h2, .join h2").forEach((h, i) => {
      const s = document.createElement("span"); s.className = "fx-h";
      s.append(side() === "a" ? P("fx-star", { animationDelay: (i * .4) + "s" }) : P("fx-flame " + ["s", "m"][i % 2], { animationDelay: (i * .2) + "s" }));
      h.prepend(s); built.push(() => s.remove());
    });
  }
  function corners() {
    document.querySelectorAll(".card, .ch, .tile, .rule, .empty").forEach(el => {
      el.classList.add("fx-c");
      ["tl", "tr", "bl", "br"].forEach(k => { const c = document.createElement("span"); c.className = "fx-k " + k; el.append(c); built.push(() => c.remove()); });
    });
  }
  function hover() {
    document.querySelectorAll(".card, .tile, .ch").forEach(el => {
      el.classList.add("fx-hv");
      const c = document.createElement("span"); c.className = "fx-hvclip"; c.append(P("fx-shine"));
      const cl = document.createElement("span"); cl.className = "fx-claws"; cl.innerHTML = "<i></i><i></i><i></i>"; c.append(cl);
      el.append(c); built.push(() => c.remove());
    });
  }
  function ambient() {
    const hero = document.querySelector(".hero"); if (!hero) return;
    const box = document.createElement("div"); box.className = "fx-amb";
    if (side() === "a") {
      for (let i = 0; i < 16; i++) { const s = rnd(18, 54);
        box.append(P("fx-mote", { left: rnd(2, 96) + "%", top: rnd(30, 95) + "%", width: s + "px", height: s + "px", backgroundImage: "url(assets/fx/mote-" + (i % 6) + ".png)",
          animationDelay: -rnd(0, 9) + "s", animationDuration: rnd(7, 12) + "s", "--dx": rnd(-40, 40) + "px" })); }
      for (let i = 0; i < 5; i++) box.append(P("fx-star " + (i % 2 ? "s" : ""), { left: rnd(4, 60) + "%", top: rnd(8, 85) + "%", animationDelay: rnd(0, 3) + "s", animationDuration: rnd(2.5, 4) + "s" }));
    } else {
      for (let i = 0; i < 22; i++) box.append(P("fx-ember", { left: rnd(0, 100) + "%", top: rnd(55, 100) + "%", backgroundImage: "url(assets/fx/ember-" + (i % 8) + ".png)",
        animationDelay: -rnd(0, 5) + "s", animationDuration: rnd(4, 7) + "s", "--dx": rnd(-60, 60) + "px", "--dy": -rnd(180, 380) + "px" }));
      for (let i = 0; i < 4; i++) box.append(P("fx-smoke", { left: rnd(0, 90) + "%", bottom: "-40px", backgroundImage: "url(assets/fx/smoke-" + (i % 2) + ".png)", animationDelay: -rnd(0, 8) + "s" }));
    }
    hero.prepend(box); built.push(() => box.remove());
  }
  function emblem() {
    const em = document.querySelector(".hero .emblem"); if (!em) return;
    const w = document.createElement("div"); w.className = "fx-em"; em.before(w); w.append(em);
    const add = el => w.append(el);
    if (side() === "a") {
      [["l", "0%", "4%", 0], ["l", "80%", "10%", .8], ["", "88%", "70%", 1.6], ["", "4%", "76%", 2.2], ["s", "47%", "-6%", 1.1]].forEach(([k, x, y, d]) =>
        add(P("fx-star " + k, { left: x, top: y, animationDelay: d + "s", animationDuration: "3.2s" })));
    } else {
      [["l", "12%"], ["l", "62%"], ["m", "36%"], ["s", "80%"], ["s", "0%"]].forEach(([k, x], i) =>
        add(P("fx-flame " + k + " fx-under", { left: x, bottom: "-12%", width: "104px", height: "168px", animationDelay: (i * .23) + "s" })));
      for (let i = 0; i < 12; i++) add(P("fx-ember", { left: rnd(10, 90) + "%", top: rnd(55, 95) + "%", width: "26px", height: "26px", backgroundImage: "url(assets/fx/ember-" + (i % 8) + ".png)",
        animationDelay: -rnd(0, 3) + "s", animationDuration: rnd(2.2, 3.5) + "s", "--dx": rnd(-40, 40) + "px", "--dy": -rnd(160, 300) + "px" }));
    }
    built.push(() => { w.before(em); w.remove(); });
  }
  function build() {
    clear();
    const F = { btn, heading, corners, hover, ambient, emblem };
    Object.keys(F).forEach(k => on(k) && F[k]());
  }
  const go = () => { build(); new MutationObserver(m => { if (m.some(x => x.attributeName === "data-side")) build(); }).observe(html, { attributes: true }); };
  // the brag feed renders later from the sheet: re-run corners/hover once it lands
  const feed = document.getElementById("feed");
  if (feed) new MutationObserver(() => { if (feed.querySelector(".card:not(.fx-c)")) build(); }).observe(feed, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
  window.BIGD_FX = { build, ALL };
})();
