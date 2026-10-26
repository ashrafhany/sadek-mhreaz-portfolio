/* Sadek Mhreaz - Media Buyer Portfolio
   Language + theme are already applied by the small script in <head> (no flash).
   This file wires the toggle buttons and the page extras. */
(function () {
  "use strict";

  var root = document.documentElement;

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* private mode: still works for this page */ }
  }

  // ---------- Language (EN / AR) ----------
  function setLang(lang) {
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    var ltr = document.getElementById("bs-css-ltr");
    var rtl = document.getElementById("bs-css-rtl");
    if (ltr && rtl) {
      ltr.media = lang === "ar" ? "not all" : "all";
      rtl.media = lang === "ar" ? "all" : "not all";
    }
    var title = root.getAttribute("data-title-" + lang);
    if (title) document.title = title;
    save("lang", lang);
    // Drop ?lang= from the URL so the saved choice wins next time
    if (location.search.indexOf("lang=") !== -1 && window.history && history.replaceState) {
      var url = new URL(location.href);
      url.searchParams.delete("lang");
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    }
  }

  document.querySelectorAll("[data-toggle-lang]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setLang(root.lang === "ar" ? "en" : "ar");
    });
  });
  // Title must match the language picked in <head>
  var initialTitle = root.getAttribute("data-title-" + root.lang);
  if (initialTitle) document.title = initialTitle;

  // ---------- Theme (light / dark) ----------
  function setTheme(theme) {
    root.setAttribute("data-theme", theme);
    root.setAttribute("data-bs-theme", theme);
    save("theme", theme);
  }

  document.querySelectorAll("[data-toggle-theme]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  });

  // ---------- Footer year ----------
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // ---------- Close the mobile menu after picking a link ----------
  var navLinks = document.getElementById("navLinks");
  if (navLinks && window.bootstrap) {
    var menu = bootstrap.Collapse.getOrCreateInstance(navLinks, { toggle: false });
    navLinks.querySelectorAll(".nav-link").forEach(function (link) {
      link.addEventListener("click", function () {
        if (navLinks.classList.contains("show")) menu.hide();
      });
    });
  }

  // ---------- Back-to-top button (sits above the WhatsApp button) ----------
  var toTop = document.createElement("button");
  toTop.type = "button";
  toTop.className = "to-top";
  toTop.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M12 19V5M6 11l6-6 6 6"/></svg>' +
    '<span class="visually-hidden" data-lang="en">Back to top</span><span class="visually-hidden" data-lang="ar">للأعلى</span>';
  toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  document.body.appendChild(toTop);
  function updateToTop() { toTop.classList.toggle("is-visible", window.scrollY > 600); }
  window.addEventListener("scroll", updateToTop, { passive: true });
  updateToTop();

  // ---------- Header turns to glass once the page leaves the top ----------
  var header = document.querySelector(".site-header");
  function updateHeader() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Hero: numbers count up from 0 ([data-count], optional data-decimals) ----------
  if (!reduceMotion) {
    document.querySelectorAll(".hero [data-count]").forEach(function (el, i) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      if (!target) return;
      var final = target.toFixed(decimals);
      // The real number stays in place until the count actually starts, so a stalled timer never shows 0
      setTimeout(function () {
        var start = null, dur = 1400;
        function step(t) {
          if (start === null) start = t;
          var p = Math.min((t - start) / dur, 1);
          el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(decimals);
          if (p < 1) requestAnimationFrame(step);
        }
        el.textContent = (0).toFixed(decimals);
        requestAnimationFrame(step);
        // Safety net: if frames never run (e.g. a background tab), still land on the real number
        setTimeout(function () { el.textContent = final; }, dur + 400);
      }, 600 + i * 100);
    });
  }

  // ---------- Leads chart (Snapchat lead-gen campaign, 1 Jul - 10 Oct 2026) ----------
  // Daily leads traced from the Ads Manager chart; they add up to the reported 240.
  var LEADS = [
    3,2,5,2,3,1,2,2,3,3,1,2,0,0,0,1,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,               // Jul
    0,0,0,0,0,6,2,4,4,2,3,1,3,1,2,3,2,2,2,2,3,1,1,2,2,1,1,2,0,2,3,               // Aug
    0,0,2,6,5,3,3,1,1,2,2,0,1,2,5,2,1,2,3,11,6,5,8,2,0,7,4,7,4,7,                // Sep
    5,0,0,9,7,7,10,4,6,1                                                          // Oct 1-10
  ];
  var chartEl = document.querySelector("[data-leads-chart]");
  var NS = "http://www.w3.org/2000/svg";
  function svgEl(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function dayDate(i) { return new Date(2026, 6, 1 + i); }
  function fmtDay(d) {
    return d.toLocaleDateString(root.lang === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short" });
  }

  function drawChart() {
    if (!chartEl) return;
    chartEl.innerHTML = "";
    var W = chartEl.clientWidth, H = chartEl.clientHeight;
    if (!W || !H) return;
    var pad = { t: 12, r: 8, b: 26, l: 26 }, max = 12;
    var iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    function x(i) { return pad.l + (i / (LEADS.length - 1)) * iw; }
    function y(v) { return pad.t + ih - (v / max) * ih; }

    var svg = svgEl("svg", { viewBox: "0 0 " + W + " " + H, role: "img", "aria-label": "Daily leads, 1 July to 10 October 2026. Total 240." }, chartEl);
    var grad = svgEl("linearGradient", { id: "leadsFill", x1: 0, y1: 0, x2: 0, y2: 1 }, svgEl("defs", {}, svg));
    svgEl("stop", { offset: "0%", "stop-color": "rgb(230,59,46)", "stop-opacity": ".28" }, grad);
    svgEl("stop", { offset: "100%", "stop-color": "rgb(230,59,46)", "stop-opacity": "0" }, grad);

    var grid = svgEl("g", { "class": "grid" }, svg), axis = svgEl("g", { "class": "axis" }, svg);
    [0, 3, 6, 9, 12].forEach(function (v) {
      svgEl("line", { x1: pad.l, x2: W - pad.r, y1: y(v), y2: y(v) }, grid);
      svgEl("text", { x: pad.l - 8, y: y(v) + 4, "text-anchor": "end" }, axis).textContent = v;
    });
    [0, 31, 62, 92].forEach(function (i) {   // 1st of each month
      svgEl("text", { x: x(i), y: H - 6, "text-anchor": i === 0 ? "start" : "middle" }, axis).textContent = fmtDay(dayDate(i));
    });

    var pts = LEADS.map(function (v, i) { return x(i).toFixed(1) + "," + y(v).toFixed(1); });
    svgEl("path", { "class": "area", d: "M" + x(0) + "," + y(0) + " L" + pts.join(" L") + " L" + x(LEADS.length - 1) + "," + y(0) + " Z" }, svg);
    svgEl("path", { "class": "line", d: "M" + pts.join(" L") }, svg);

    // Hover: crosshair + dot + tooltip on the nearest day
    var cross = svgEl("line", { "class": "cross", y1: pad.t, y2: pad.t + ih, visibility: "hidden" }, svg);
    var dot = svgEl("circle", { "class": "dot", r: 4.5, visibility: "hidden" }, svg);
    var tip = document.createElement("div");
    tip.className = "chart__tip"; tip.hidden = true;
    chartEl.appendChild(tip);
    function show(clientX) {
      var r = svg.getBoundingClientRect();
      var i = Math.round(((clientX - r.left - pad.l) / iw) * (LEADS.length - 1));
      i = Math.max(0, Math.min(LEADS.length - 1, i));
      var cx = x(i), cy = y(LEADS[i]);
      cross.setAttribute("x1", cx); cross.setAttribute("x2", cx); cross.setAttribute("visibility", "visible");
      dot.setAttribute("cx", cx); dot.setAttribute("cy", cy); dot.setAttribute("visibility", "visible");
      tip.innerHTML = "<b>" + LEADS[i] + "</b>" + (root.lang === "ar" ? "عملاء · " : "leads · ") + fmtDay(dayDate(i));
      tip.hidden = false;
      tip.style.left = Math.max(60, Math.min(W - 60, cx)) + "px";
    }
    function hide() { cross.setAttribute("visibility", "hidden"); dot.setAttribute("visibility", "hidden"); tip.hidden = true; }
    svg.addEventListener("pointermove", function (e) { show(e.clientX); });
    svg.addEventListener("pointerdown", function (e) { show(e.clientX); });
    svg.addEventListener("pointerleave", hide);

    // Same data as a table for screen readers (wrapped: .visually-hidden can't shrink a <table> itself)
    var srTable = document.createElement("div");
    srTable.className = "visually-hidden";
    srTable.innerHTML = "<table><caption>Daily leads</caption><tr><th>Date</th><th>Leads</th></tr>" +
      LEADS.map(function (v, i) { return "<tr><td>" + fmtDay(dayDate(i)) + "</td><td>" + v + "</td></tr>"; }).join("") + "</table>";
    chartEl.appendChild(srTable);
  }
  drawChart();
  var resizeTimer;
  window.addEventListener("resize", function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawChart, 150); });
  document.querySelectorAll("[data-toggle-lang]").forEach(function (btn) { btn.addEventListener("click", drawChart); });

  // ---------- Hero: results panel follows the mouse a little (desktop only) ----------
  var hero = document.querySelector(".hero");
  var finePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (hero && finePointer && !reduceMotion) {
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
      hero.style.setProperty("--my", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
    });
    hero.addEventListener("mouseleave", function () {
      hero.style.setProperty("--mx", 0);
      hero.style.setProperty("--my", 0);
    });
  }

  // ---------- Fade sections in as they scroll into view ----------
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length && "IntersectionObserver" in window) {
    root.classList.add("js-reveal");
    // Stagger items that sit side by side (cards, services, experience rows)
    revealEls.forEach(function (el) {
      var siblings = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.hasAttribute("data-reveal"); });
      var idx = siblings.indexOf(el);
      if (siblings.length > 1) el.style.setProperty("--d", (idx % 4) * 0.09 + "s");
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  }
})();
