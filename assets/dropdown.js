/* BigD dropdowns: every <select> on the page becomes a styled dropdown in the faction colours
   (no grey phone/OS picker). The real <select> stays in the page, hidden, and keeps working:
   page scripts read/set select.value, fill options later, and listen for "change" as before.
   Added 19 Nov (Dejan: "all drop-down menus use our design, not the phone's default grey"). */
(function () {
  var css = document.createElement("style");
  css.textContent = [
    ".bd-dd{position:relative;display:inline-block;width:100%;min-width:0;font-family:var(--body,system-ui,sans-serif)}",
    ".bd-dd>select{position:absolute!important;opacity:0!important;pointer-events:none!important;width:1px!important;height:1px!important;left:0;bottom:0}",
    ".bd-dd-btn{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:10px;width:100%;min-height:44px;padding:9px 12px;cursor:pointer;",
    "font:500 16px/1.2 var(--body,system-ui,sans-serif);color:var(--paper,#f3e6c4);background:var(--panel,#1c1915);",
    "border:1px solid var(--line,#3a3128);border-left:3px solid var(--side,#b3231b);border-radius:4px;text-transform:none;letter-spacing:0}",
    ".bd-dd-btn:hover{border-color:var(--side,#b3231b)}",
    ".bd-dd-btn:focus-visible{outline:2px solid var(--gold,#c9a24a);outline-offset:2px}",
    ".bd-dd-btn span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left}",
    ".bd-dd-btn::after{content:'';flex:none;width:9px;height:9px;border-right:2px solid var(--gold,#c9a24a);border-bottom:2px solid var(--gold,#c9a24a);transform:translateY(-3px) rotate(45deg);transition:transform .15s}",
    ".bd-dd.open .bd-dd-btn::after{transform:translateY(2px) rotate(-135deg)}",
    ".bd-dd.open .bd-dd-btn{border-color:var(--side,#b3231b);box-shadow:0 0 0 1px var(--side,#b3231b)}",
    ".bd-dd-list{position:absolute;z-index:60;left:0;right:0;top:calc(100% + 4px);max-height:min(320px,55vh);overflow:auto;overscroll-behavior:contain;margin:0;padding:4px;list-style:none;",
    "background:var(--panel,#1c1915);border:1px solid var(--side,#b3231b);border-radius:4px;box-shadow:0 12px 30px rgba(0,0,0,.55)}",
    ".bd-dd.up .bd-dd-list{top:auto;bottom:calc(100% + 4px)}",
    ".bd-dd-list li{padding:10px 12px;border-radius:3px;cursor:pointer;color:var(--paper,#f3e6c4);font:500 16px/1.25 var(--body,system-ui,sans-serif);text-transform:none;letter-spacing:0}",
    ".bd-dd-list li:hover,.bd-dd-list li.act{background:rgba(255,255,255,.08);box-shadow:inset 3px 0 0 var(--side,#b3231b)}",
    ".bd-dd-list li[aria-selected=true]{color:var(--gold,#c9a24a);font-weight:700}",
    ".bd-dd-list li[aria-selected=true]::before{content:'';display:inline-block;width:6px;height:6px;margin:0 8px 2px 0;background:var(--side,#b3231b);transform:rotate(45deg)}",
    ".bd-dd-list li.grp{cursor:default;color:var(--muted,#a39a8a);font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:8px 12px 4px}",
    ".bd-dd-list li[aria-disabled=true]{opacity:.45;cursor:default}"
  ].join("");
  document.head.appendChild(css);

  var uid = 0;
  function enhance(sel) {
    if (sel.dataset.bdDd || sel.multiple || sel.size > 1) return;
    sel.dataset.bdDd = "1";
    var id = "bd-dd-" + (++uid);
    var wrap = document.createElement("span"); wrap.className = "bd-dd";
    var btn = document.createElement("button"); btn.type = "button"; btn.className = "bd-dd-btn";
    btn.setAttribute("aria-haspopup", "listbox"); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", id);
    var lab = document.createElement("span"); btn.appendChild(lab);
    var list = document.createElement("ul"); list.className = "bd-dd-list"; list.id = id; list.setAttribute("role", "listbox"); list.hidden = true;
    sel.parentNode.insertBefore(wrap, sel); wrap.appendChild(sel); wrap.appendChild(btn); wrap.appendChild(list);
    sel.tabIndex = -1; sel.setAttribute("aria-hidden", "true");
    var label = sel.closest("label");
    if (label) { var t = (label.childNodes[0] && label.childNodes[0].nodeType === 3) ? label.childNodes[0].textContent.trim() : ""; if (t) btn.setAttribute("aria-label", t); }
    if (sel.id) { var ext = document.querySelector('label[for="' + sel.id + '"]'); if (ext) ext.addEventListener("click", function (e) { e.preventDefault(); btn.focus(); }); }

    function sync() {
      var o = sel.options[sel.selectedIndex];
      lab.textContent = o ? o.textContent : "";
      if (!list.hidden) build();
    }
    function build() {
      list.textContent = "";
      var lastGroup = null;
      Array.prototype.forEach.call(sel.options, function (o, i) {
        if (o.hidden) return;
        var g = o.parentNode.tagName === "OPTGROUP" ? o.parentNode : null;
        if (g && g !== lastGroup) { var h = document.createElement("li"); h.className = "grp"; h.textContent = g.label; h.setAttribute("role", "presentation"); list.appendChild(h); lastGroup = g; }
        var li = document.createElement("li"); li.setAttribute("role", "option"); li.dataset.i = i; li.textContent = o.textContent;
        li.setAttribute("aria-selected", i === sel.selectedIndex ? "true" : "false");
        if (o.disabled) li.setAttribute("aria-disabled", "true");
        list.appendChild(li);
      });
    }
    function items() { return Array.prototype.slice.call(list.querySelectorAll('li[role=option]:not([aria-disabled=true])')); }
    function setAct(li) { items().forEach(function (x) { x.classList.toggle("act", x === li); }); if (li) li.scrollIntoView({ block: "nearest" }); }
    function open() {
      build(); list.hidden = false; wrap.classList.add("open"); btn.setAttribute("aria-expanded", "true");
      var r = btn.getBoundingClientRect(); wrap.classList.toggle("up", window.innerHeight - r.bottom < 260 && r.top > window.innerHeight - r.bottom);
      setAct(list.querySelector('li[aria-selected=true]') || items()[0]);
      document.addEventListener("pointerdown", outside, true);
    }
    function close(focus) {
      list.hidden = true; wrap.classList.remove("open", "up"); btn.setAttribute("aria-expanded", "false");
      document.removeEventListener("pointerdown", outside, true);
      if (focus) btn.focus();
    }
    function outside(e) { if (!wrap.contains(e.target)) close(false); }
    function choose(i) {
      i = +i; if (isNaN(i)) return;
      var changed = sel.selectedIndex !== i;
      sel.selectedIndex = i; sync(); close(true);
      if (changed) { sel.dispatchEvent(new Event("input", { bubbles: true })); sel.dispatchEvent(new Event("change", { bubbles: true })); }
    }
    btn.addEventListener("click", function () { list.hidden ? open() : close(true); });
    list.addEventListener("click", function (e) { var li = e.target.closest("li[role=option]"); if (li && li.getAttribute("aria-disabled") !== "true") choose(li.dataset.i); });
    btn.addEventListener("keydown", function (e) {
      var its = items(), act = list.querySelector("li.act"), k = its.indexOf(act);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault(); if (list.hidden) { open(); return; }
        k = e.key === "ArrowDown" ? Math.min(its.length - 1, k + 1) : Math.max(0, k - 1); setAct(its[k]);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); if (list.hidden) open(); else if (act) choose(act.dataset.i);
      } else if (e.key === "Escape" || e.key === "Tab") { if (!list.hidden) close(e.key === "Escape"); }
      else if (e.key.length === 1 && !list.hidden) {
        var ch = e.key.toLowerCase(), hit = its.find(function (x, j) { return j > k && x.textContent.trim().toLowerCase().indexOf(ch) === 0; }) || its.find(function (x) { return x.textContent.trim().toLowerCase().indexOf(ch) === 0; });
        if (hit) setAct(hit);
      }
    });
    sel.addEventListener("change", sync);
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["selected", "label", "disabled", "hidden"] });
    // page scripts that set select.value / selectedIndex directly (no change event) still update the label
    ["value", "selectedIndex"].forEach(function (p) {
      var d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, p);
      Object.defineProperty(sel, p, { configurable: true, get: function () { return d.get.call(sel); }, set: function (v) { d.set.call(sel, v); sync(); } });
    });
    sync();
  }
  function run() { Array.prototype.forEach.call(document.querySelectorAll("select"), enhance); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
  new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType !== 1) return; if (n.tagName === "SELECT") enhance(n); else if (n.querySelectorAll) Array.prototype.forEach.call(n.querySelectorAll("select"), enhance); }); }); })
    .observe(document.documentElement, { childList: true, subtree: true });
})();
