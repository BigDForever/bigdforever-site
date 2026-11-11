/* BigDForever night batch (12 Nov): Review Board cards 45-54. Each block runs only when its key is on (window.V11, see v11-flags.js). */
(function () {
  var V = window.V11 || {};
  var H = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var u = function (f) { return new URL("assets/v11/n12/" + f, location.href).href; };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ICON = {
    yt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z"/></svg>',
    tt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.3 6.3 0 1 0 5.4 6.3V8.6a7.9 7.9 0 0 0 4.6 1.5V6.7a4.6 4.6 0 0 1-4.6-4.7Z"/></svg>',
    dc: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.32 4.37A19.8 19.8 0 0 0 15.43 2.8a13.6 13.6 0 0 0-.63 1.3 18.4 18.4 0 0 0-5.6 0 13 13 0 0 0-.64-1.3A19.7 19.7 0 0 0 3.68 4.37C.56 9.05-.29 13.6.13 18.1a19.9 19.9 0 0 0 6.04 3.06 14.7 14.7 0 0 0 1.3-2.1 12.9 12.9 0 0 1-2.04-.98l.5-.39a14.2 14.2 0 0 0 12.15 0l.5.39c-.65.39-1.33.71-2.05.98.37.74.81 1.44 1.3 2.1a19.8 19.8 0 0 0 6.05-3.06c.5-5.2-.84-9.7-3.56-13.73ZM8.02 15.33c-1.18 0-2.16-1.09-2.16-2.42s.95-2.42 2.16-2.42 2.18 1.1 2.16 2.42c0 1.33-.95 2.42-2.16 2.42Zm7.96 0c-1.18 0-2.16-1.09-2.16-2.42s.95-2.42 2.16-2.42 2.18 1.1 2.16 2.42c0 1.33-.94 2.42-2.16 2.42Z"/></svg>',
    up: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3l6 8H2z"/></svg>',
    down: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 13L2 5h12z"/></svg>',
    post: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.7 2.3c-4.6.4-9.1 3-11.6 7.4l-1.9 3.5 3.6-1.3-3.4 5.3-1.7 3.3a.8.8 0 0 0 1.4.7l1.6-3c5.4-1.1 9.6-5.2 11.4-10.4l.6-5.5ZM3 21.2h9v1.5H3z"/></svg>',
    vote: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 10h4v11H2zM8 21h9.6a2 2 0 0 0 2-1.6l1.4-7A2 2 0 0 0 19 10h-5.3l.8-3.8a1.7 1.7 0 0 0-3-1.4L8 9.5z"/></svg>',
    crown: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 7l5 4 5-7 5 7 5-4-2 11H4zM4 19.5h16V22H4z"/></svg>'
  };
  function ready(f) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", f); else f(); }

  ready(function () {
    var preview = !/bigdforever/i.test(location.hostname) || /v11\./.test(location.hostname);

    // [shorts] 45 · our latest Shorts (newest first). A Short shows from the minute it goes public.
    if (V.shorts) {
      var SHORTS = [
        { t: "She came back", d: "Silverpine · Her Lightness", yt: "5jAKIHe_Vuk", tt: "7706988084730154248", img: "short-came-back.webp", at: "2026-11-12T15:15:00Z", when: "Thu 16:15" },
        { t: "Ping. Ping. Ping.", d: "Pyrewood · Light + Wind", yt: "RyouSVwREfw", tt: "7706982326063992072", img: "short-ping.webp", at: "2026-11-11T18:30:00Z", when: "Wed 19:30" }
      ];
      var sec = $("#brags .wrap"), head = sec && $(".head", sec);
      if (head && !$(".n12-shorts")) {
        var now = Date.now(), cards = "";
        SHORTS.forEach(function (s) {
          var live = Date.parse(s.at) <= now; if (!live && !preview) return;
          cards += '<article class="n12-short"><a class="n12-sh-pic" href="https://youtube.com/shorts/' + s.yt + '" target="_blank" rel="noopener" aria-label="Watch ' + s.t + ' on YouTube">' +
            '<img src="' + u(s.img) + '" alt="" loading="lazy" width="432" height="768"><span class="n12-play"></span>' + (live ? "" : '<span class="n12-soon">Goes live ' + s.when + '</span>') + '</a>' +
            '<h3>' + s.t + '</h3><p>' + s.d + '</p><div class="n12-sh-links">' +
            '<a href="https://youtube.com/shorts/' + s.yt + '" target="_blank" rel="noopener">' + ICON.yt + 'YouTube</a>' +
            '<a href="https://www.tiktok.com/@bigdforever/video/' + s.tt + '" target="_blank" rel="noopener">' + ICON.tt + 'TikTok</a></div></article>';
        });
        if (cards) {
          cards += '<a class="n12-sh-more" href="https://www.tiktok.com/@bigdforever" target="_blank" rel="noopener"><b>New Short every day.</b><span>Your clip could be next: send it in and the anchors read it on air.</span><i>Follow on TikTok →</i></a>';
          var box = document.createElement("div"); box.className = "n12-shorts";
          box.innerHTML = '<div class="n12-sh-head"><span class="n12-dot"></span>Fresh off the anchors\' desk</div><div class="n12-sh-row">' + cards + '</div>';
          head.insertAdjacentElement("afterend", box);
        }
      }
    }

    // [resetclock] 46 · Week N is on + time to the EU weekly reset (Wed 04:00 UTC)
    if (V.resetclock) {
      var cd = document.getElementById("countdown");
      var FIRST_END = Date.parse("2026-11-11T04:00:00Z"), WK = 7 * 864e5, LAUNCH = Date.parse("2026-11-04T23:00:00Z");
      var clock = function () {
        if (!cd) return; var n = Date.now(); if (n < LAUNCH) return;
        var week = n < FIRST_END ? 1 : 2 + Math.floor((n - FIRST_END) / WK), end = FIRST_END + (week - 1) * WK, d = Math.max(0, end - n);
        var dd = Math.floor(d / 864e5), hh = Math.floor(d % 864e5 / 36e5), mm = Math.floor(d % 36e5 / 6e4);
        cd.innerHTML = '<span class="n12-wk"><span class="n12-dot"></span>Week ' + week + ' is on</span><span class="n12-rs"><span>EU reset in</span><b class="n12-t">' + dd + 'd ' + String(hh).padStart(2, "0") + 'h ' + String(mm).padStart(2, "0") + 'm</b></span>';
      };
      setTimeout(clock, 50); setInterval(clock, 20000);
    }

    // [votes] 47 · the vote table becomes five tokens
    if (V.votes) {
      var tb = $(".votes table");
      if (tb && !$(".n12-votes")) {
        var ARW = { pride: ["up", 1], respect: ["up", 2], cringe: ["down", 1], salt: ["up", 1], zzz: ["down", 1] };
        var g = document.createElement("div"); g.className = "n12-votes";
        $$("tbody tr", tb).forEach(function (tr) {
          var c = $$("td", tr).map(function (td) { return td.textContent.trim(); }); if (c.length < 3) return;
          var k = c[0].toLowerCase(), a = ARW[k] || ["up", 1], who = /enemy/i.test(c[1]) ? "enemy" : /own/i.test(c[1]) ? "own" : "any";
          var el = document.createElement("div"); el.className = "n12-vote" + (k === "respect" ? " best" : "");
          el.innerHTML = '<span class="ar ' + a[0] + '" title="' + (a[0] === "up" ? "Pushes it up" : "Pushes it down") + '">' + new Array(a[1] + 1).join(ICON[a[0]]) + '</span>' +
            '<span class="w">' + c[0] + '</span><span class="who ' + who + '">' + c[1] + '</span><span class="fx">' + c[2] + '</span>';
          g.appendChild(el);
        });
        tb.insertAdjacentElement("afterend", g);
      }
    }

    // [recruit] 48 · Your faction needs you
    if (V.recruit) {
      var jw = $(".join .wrap"), jh = jw && $(".head", jw), links = jw && $(".links", jw);
      if (jw && links && !$(".n12-recruit")) {
        if (jh && !$(".n12-eyebrow", jh)) jh.insertAdjacentHTML("afterbegin", '<div class="n12-eyebrow">Your faction needs you</div>');
        var fig = document.createElement("div"); fig.className = "n12-recruit"; fig.setAttribute("aria-hidden", "true");
        fig.innerHTML = '<img src="' + u("grukk-pointing.webp") + '" alt="" loading="lazy"><img src="' + u("vellaris-pointing.webp") + '" alt="" loading="lazy">';
        jw.insertBefore(fig, links);
      }
    }

    // [actionbar] 49 · phones: bottom bar with Submit + Discord once the hero is gone, hidden again at the bottom band
    if (V.actionbar) {
      var sub = $("#cta-submit"), dis = $("#cta-discord"), hero = $(".hero"), join = $("#socials");
      if (sub && hero && !$(".n12-bar")) {
        var bar = document.createElement("nav"); bar.className = "n12-bar"; bar.setAttribute("aria-label", "Quick actions");
        bar.innerHTML = '<a class="s" href="#">Submit a brag</a><a class="d" href="#" aria-label="Discord">' + ICON.dc + '</a>';
        document.body.appendChild(bar);
        var sync = function () { bar.firstChild.href = sub.href; bar.firstChild.target = sub.target || "_blank"; bar.firstChild.rel = "noopener"; if (dis) { bar.lastChild.href = dis.href; bar.lastChild.target = "_blank"; bar.lastChild.rel = "noopener"; } };
        sync(); setTimeout(sync, 800);
        var heroOut = false, joinIn = false, upd = function () { bar.classList.toggle("on", heroOut && !joinIn); };
        new IntersectionObserver(function (es) { heroOut = !es[0].isIntersecting; upd(); }).observe(hero);
        if (join) new IntersectionObserver(function (es) { joinIn = es[0].isIntersecting; upd(); }, { rootMargin: "0px 0px -20% 0px" }).observe(join);
      }
    }

    // [steps] 51 · icon discs on one path
    if (V.steps) {
      $$(".steps .step").forEach(function (s, i) {
        if ($(".n12-st", s)) return;
        s.insertAdjacentHTML("afterbegin", '<div class="n12-st"><span class="ic">' + [ICON.post, ICON.vote, ICON.crown][i % 3] + '</span><span class="no">' + (i + 1) + '</span></div>');
      });
    }

    // [onair] 54 · War news tab on the ticker
    if (V.onair) $$(".ticker").forEach(function (t) {
      if ($(".n12-onair", t)) return;
      t.insertAdjacentHTML("afterbegin", '<div class="n12-onair"><i class="n12-dot"></i>War news</div>');
    });

    // [sweep] 53 · when the side changes, the new faction sweeps across the page (board replay: html gets .bfx-hot)
    if (V.sweep && !reduce) {
      var last = H.getAttribute("data-side");
      var play = function () {
        var s = H.getAttribute("data-side") || "horde", el = document.createElement("div");
        el.className = "n12-sweep " + s; el.innerHTML = "<i></i><i></i>"; document.body.appendChild(el);
        setTimeout(function () { el.remove(); }, 1300);
      };
      new MutationObserver(function () {
        var s = H.getAttribute("data-side");
        if (s && last && s !== last) play();
        if (H.classList.contains("bfx-hot") && !H._n12hot) { H._n12hot = 1; play(); setTimeout(function () { H._n12hot = 0; }, 1500); }
        last = s;
      }).observe(H, { attributes: true, attributeFilter: ["data-side", "class"] });
    }
  });
})();
