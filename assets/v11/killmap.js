/* v1.1 [killmap:a|b] War Map page: the kill map drawn on Dejan's Azeroth-style parchment map (ChatGPT art, 10 Nov).
   Off unless ?v11=killmap:a (glowing pins) or killmap:b (faction banners). Uses the page's own zones, data and Field report:
   a pin click "clicks" the zone, so the panel, top 5 and CSV data all keep working. Zone names come from code, the picture has none. */
(function () {
  var V = window.V11 || {};
  if (!V.killmap) return;
  var svg = document.getElementById("war");
  if (!svg || typeof GEO === "undefined") return;
  var OPT = V.killmap === "b" ? "b" : "a";
  var NS = "http://www.w3.org/2000/svg", W = 1672, H = 941;
  var IMG = new URL("assets/v11/art/war-map-azeroth.jpg", location.href).href;

  // our sketch map (1000 x 840) -> the picture (1672 x 941), one box per continent
  var BOX = {
    K: { s: [38, 70, 448, 792], d: [205, 135, 640, 790] },
    E: { s: [568, 44, 974, 818], d: [1105, 112, 1515, 782] }
  };
  function place(x, y, c) {
    var b = BOX[c]; if (!b) return [x, y];
    return [b.d[0] + (x - b.s[0]) / (b.s[2] - b.s[0]) * (b.d[2] - b.d[0]), b.d[1] + (y - b.s[1]) / (b.s[3] - b.s[1]) * (b.d[3] - b.d[1])];
  }
  var FIX = { "Teldrassil": [330, 132], "Zephras Isle": [655, 132] }; // islands sit on their own islands in the picture

  var css = document.createElement("style");
  css.textContent = [
    "html.v11-killmap .map{background:#120e0a}",
    "html.v11-killmap #war > :not(.km){display:none}",
    ".km-pin{cursor:pointer;outline:none}",
    ".km-pin .dot{stroke:#f3e6c4;stroke-width:2;transition:r .2s}",
    ".km-pin .glow{opacity:.55;filter:url(#kmBlur)}",
    ".km-pin:hover .dot,.km-pin:focus .dot,.km-pin.sel .dot{stroke:#fff;stroke-width:3}",
    ".km-pin .nm{font:700 21px/1 'Barlow Condensed','Barlow',sans-serif;letter-spacing:.06em;text-transform:uppercase;fill:#f6ead0;paint-order:stroke;stroke:#140f0a;stroke-width:4px;stroke-linejoin:round;opacity:0;transition:opacity .15s;pointer-events:none}",
    ".km-pin:hover .nm,.km-pin:focus .nm,.km-pin.sel .nm,.km-pin.top .nm{opacity:1}",
    ".km-pin.none .dot{fill:#4a3d2b;stroke:#c9b48a;stroke-opacity:.7}",
    ".km-pin.none .glow{display:none}",
    "@keyframes kmPulse{0%,100%{opacity:.35}50%{opacity:.8}}",
    ".km-pin.hot .glow{animation:kmPulse 2.4s ease-in-out infinite}",
    ".km-flag path.cloth{stroke:#140f0a;stroke-width:1.5}",
    ".km-flag .pole{stroke:#140f0a;stroke-width:4}.km-flag .pole2{stroke:#e9d9b4;stroke-width:1.6}",
    "@media (prefers-reduced-motion:reduce){.km-pin.hot .glow{animation:none}}"
  ].join("\n");
  document.head.appendChild(css);

  var root;
  function mk(tag, attrs, parent) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }

  function kills(name) {
    var p = svg.querySelector('[data-zone="' + CSS.escape(name) + '"]'); if (!p) return { a: 0, h: 0, el: null };
    var m = /Alliance (\d+), Horde (\d+)/.exec(p.getAttribute("aria-label") || "");
    return { a: m ? +m[1] : 0, h: m ? +m[2] : 0, el: p };
  }

  function draw() {
    if (root) root.remove();
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("aria-label", "War map of Azeroth. Each pin is a zone; click one for its field report.");
    root = mk("g", { "class": "km" }, svg);
    var defs = mk("defs", {}, root);
    defs.innerHTML = '<filter id="kmBlur" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="7"/></filter>' +
      '<pattern id="kmCont" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="10" fill="#4f86e6"/><rect x="5" width="5" height="10" fill="#d0362a"/></pattern>' +
      '<radialGradient id="kmVig" cx="50%" cy="50%" r="72%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>';
    mk("image", { href: IMG, x: 0, y: 0, width: W, height: H, preserveAspectRatio: "xMidYMid slice" }, root);
    mk("rect", { width: W, height: H, fill: "#0c0906", opacity: .22 }, root);
    mk("rect", { width: W, height: H, fill: "url(#kmVig)" }, root);

    var zones = GEO.concat(ISLANDS), max = 1, info = {};
    zones.forEach(function (z) { var k = kills(z.n); info[z.n] = k; max = Math.max(max, k.a + k.h); });
    var ranked = zones.slice().sort(function (p, q) { var a = info[p.n], b = info[q.n]; return (b.a + b.h) - (a.a + a.h); });
    var top = ranked.slice(0, 5).filter(function (z) { var k = info[z.n]; return k.a + k.h > 0; }).map(function (z) { return z.n; });
    var hot = (typeof WAR !== "undefined" && WAR.hot) || 25;

    var pins = mk("g", {}, root);
    zones.forEach(function (z) {
      var k = info[z.n], t = k.a + k.h;
      var xy = FIX[z.n] || place(z.x != null ? z.x : z.cx, z.y != null ? z.y : z.cy, z.c);
      var side = !t ? "none" : k.a === k.h ? "cont" : (k.a > k.h ? "ally" : "horde");
      var col = side === "ally" ? "#4f86e6" : side === "horde" ? "#d0362a" : side === "cont" ? "url(#kmCont)" : "#4a3d2b";
      var glowCol = side === "ally" ? "#7fb0ff" : side === "horde" ? "#ff5a3c" : "#e8c66a";
      var r = t ? 9 + 13 * Math.sqrt(t / max) : 6;
      var g = mk("g", { "class": "km-pin " + side + (t >= hot ? " hot" : "") + (top.indexOf(z.n) !== -1 ? " top" : ""), transform: "translate(" + xy[0].toFixed(1) + " " + xy[1].toFixed(1) + ")",
        tabindex: 0, role: "button", "aria-label": z.n + (t ? ": Alliance " + k.a + ", Horde " + k.h : ": no blood yet"), "data-km": z.n }, pins);
      if (OPT === "a" || !t) {
        mk("circle", { "class": "glow", r: (r * 1.9).toFixed(1), fill: glowCol }, g);
        mk("circle", { "class": "dot", r: r.toFixed(1), fill: col }, g);
      } else {
        // option B: a faction banner planted in the zone, taller with more kills
        var h = 42 + 40 * Math.sqrt(t / max), fw = 26 + 16 * Math.sqrt(t / max);
        var f = mk("g", { "class": "km-flag" }, g);
        mk("ellipse", { "class": "glow", rx: fw, ry: fw * .45, fill: glowCol }, f);
        mk("path", { "class": "pole", d: "M0 2V" + (-h).toFixed(1) }, f);
        mk("path", { "class": "pole2", d: "M0 2V" + (-h).toFixed(1) }, f);
        mk("path", { "class": "cloth", fill: col, d: "M1 " + (-h).toFixed(1) + "h" + fw.toFixed(1) + "l-5 " + (fw * .32).toFixed(1) + "l5 " + (fw * .32).toFixed(1) + "h" + (-fw).toFixed(1) + "z" }, f);
      }
      var lab = mk("text", { "class": "nm", y: (OPT === "b" && t ? 18 : r + 18).toFixed(1), "text-anchor": "middle" }, g);
      lab.textContent = z.n;
      var open = function () { if (k.el) k.el.dispatchEvent(new MouseEvent("click", { bubbles: true })); mark(z.n); };
      g.addEventListener("click", open);
      g.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });
  }
  function mark(n) { svg.querySelectorAll(".km-pin").forEach(function (p) { p.classList.toggle("sel", p.dataset.km === n); }); }

  // redraw whenever the page re-renders its data (CSV arrives, demo data, etc.)
  if (typeof window.render === "function") { var orig = window.render; window.render = function () { var r = orig.apply(this, arguments); try { draw(); } catch (e) {} return r; }; }
  // zone picked from the list / top 5 / jump menu: highlight its pin too
  document.addEventListener("click", function (e) { var b = e.target.closest && e.target.closest("[data-zone]"); if (b && !b.closest("#war")) setTimeout(function () { mark(b.dataset.zone); }, 0); });
  draw();
  // the Whole world / Kalimdor / Eastern Kingdoms zoom buttons and the "names hidden" hint belong to the old sketch
  var vw = document.querySelector(".views"); if (vw) vw.style.display = "none";
  css.textContent += "\nhtml.v11-killmap #hint{display:none!important}";
})();
