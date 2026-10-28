/* Runs in <head> before the page paints: picks language + theme so nothing flashes.
   On the live site the URL decides the language (/ar/... is Arabic, everything else English),
   so search engines index each language at its own address. Opened as a local file it falls
   back to ?lang= / the saved choice / the browser language. */
(function () {
  var SITE = "https://sadek-mhreaz.vercel.app";
  var d = document.documentElement, saved = {}, lang;
  try { saved.lang = localStorage.getItem("lang"); saved.theme = localStorage.getItem("theme"); } catch (e) {}
  var browserAr = (navigator.language || "").slice(0, 2) === "ar";

  if (/^https?:$/.test(location.protocol)) {
    var isAr = /^\/ar(\/|$)/.test(location.pathname);
    var bot = /bot|crawl|spider|slurp|lighthouse|facebookexternalhit|whatsapp/i.test(navigator.userAgent);
    var wantsAr = saved.lang ? saved.lang === "ar" : browserAr && !bot;
    // First visit on an English URL from an Arabic browser (or Arabic was picked before): go to the Arabic URL
    if (!isAr && wantsAr) { location.replace("/ar" + location.pathname + location.search + location.hash); return; }
    lang = isAr ? "ar" : "en";

    var path = location.pathname.replace(/^\/ar(?=\/|$)/, "").replace(/index\.html$/, "") || "/";
    var add = function (rel, href, hreflang) {
      var l = document.createElement("link");
      l.rel = rel; l.href = href;
      if (hreflang) l.hreflang = hreflang;
      document.head.appendChild(l);
    };
    add("canonical", SITE + (isAr ? "/ar" : "") + path);
    add("alternate", SITE + path, "en");
    add("alternate", SITE + "/ar" + path, "ar");
    add("alternate", SITE + path, "x-default");
  } else {
    var q = new URLSearchParams(location.search).get("lang");
    lang = (q === "ar" || q === "en") ? q : saved.lang || (browserAr ? "ar" : "en");
  }

  d.lang = lang; d.dir = lang === "ar" ? "rtl" : "ltr";
  var theme = saved.theme === "light" ? "light" : "dark";
  d.setAttribute("data-theme", theme); d.setAttribute("data-bs-theme", theme);

  var title = d.getAttribute("data-title-" + lang);
  if (title) document.title = title;
  var desc = document.querySelector('meta[name="description"]');
  if (lang === "ar" && desc && desc.getAttribute("data-ar")) desc.setAttribute("content", desc.getAttribute("data-ar"));
})();
