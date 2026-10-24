/* HN HUB: loads everything you edit in /admin from the /content folder. */
(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };

  function load(name) {
    return fetch("" + name + ".json", { cache: "no-store" })
      .then(function (r) { if (!r.ok) throw new Error(name); return r.json(); })
      .catch(function () { return {}; });
  }

  function make(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined && text !== null) n.textContent = text;
    return n;
  }

  // Only allow safe link types.
  function safeLink(url) {
    url = String(url || "").trim();
    if (!url) return "";
    if (/^(https?:|mailto:|tel:|#|\/)/i.test(url)) return url;
    return "https://" + url;
  }

  function safeImage(url) {
    url = String(url || "").trim();
    if (!url) return "";
    if (/^[a-z][a-z0-9+.-]*:/i.test(url) && !/^https?:\/\//i.test(url)) return "";
    return url;
  }

  var S = {}; // settings

  function whatsappUrl(msg) {
    var n = String(S.whatsapp || "").replace(/\D/g, "");
    if (!n) return "";
    return "https://wa.me/" + n + (msg ? "?text=" + encodeURIComponent(msg) : "");
  }

  function resolveLink(url, fallbackMsg) {
    if (String(url).trim().toLowerCase() === "whatsapp") return whatsappUrl(fallbackMsg);
    return safeLink(url);
  }

  function setText(id, value) { var n = $(id); if (n) n.textContent = value || ""; }

  /* ---------- Settings, header, footer, contact ---------- */
  function renderSettings() {
    var brand = S.brand_name || "HN HUB";
    document.title = brand + " | " + (S.tagline || "");
    setText("brandName", brand);
    setText("brandTagline", S.tagline);
    $("brandMark").textContent = brand.replace(/[^A-Za-z0-9]/g, "").slice(0, 2).toUpperCase() || "HN";
    setText("footerText", "© " + new Date().getFullYear() + " " + brand + (S.footer_text ? " · " + S.footer_text : ""));

    var wa = whatsappUrl("Hello! I found you on your website.");
    var waBtn = $("contactWhatsapp");
    if (wa) { waBtn.href = wa; waBtn.target = "_blank"; waBtn.rel = "noopener"; waBtn.hidden = false; }

    var mail = $("contactEmail");
    if (S.email) { mail.href = "mailto:" + S.email; mail.textContent = S.email; mail.hidden = false; }

    var socials = $("socials");
    [["Instagram", S.instagram], ["TikTok", S.tiktok], ["Facebook", S.facebook], ["YouTube", S.youtube], ["GitHub", S.github]]
      .forEach(function (s) {
        var href = safeLink(s[1]);
        if (!href) return;
        var li = make("li");
        var a = make("a", "", s[0]);
        a.href = href; a.target = "_blank"; a.rel = "noopener";
        li.appendChild(a); socials.appendChild(li);
      });
  }

  /* ---------- Hero ---------- */
  function renderHome(d) {
    setText("heroEyebrow", d.eyebrow);
    setText("heroHeadline", d.headline);
    setText("heroIntro", d.intro);
    setText("heroBtn1", d.button_text || "Contact us");
    var b2 = $("heroBtn2");
    if (d.second_button_text) b2.textContent = d.second_button_text + " →"; else b2.hidden = true;
    var img = safeImage(d.hero_image);
    if (img) $("heroImage").src = img; else $("heroImage").parentNode.hidden = true;
    var ul = $("heroStats");
    (d.stats || []).forEach(function (s) {
      var li = make("li");
      li.appendChild(make("strong", "", s.number));
      li.appendChild(make("span", "", s.label));
      ul.appendChild(li);
    });
  }

  /* ---------- Adverts ---------- */
  function renderAdverts(d) {
    var items = (d.items || []).filter(function (i) { return i && i.show !== false && i.title; });
    if (!items.length) { $("offers").hidden = true; $("navOffers").hidden = true; return; }
    setText("offersTitle", d.section_title);
    setText("offersText", d.section_text);
    var grid = $("offerGrid");
    items.forEach(function (i) {
      var card = make("article", "offer-card");
      var img = safeImage(i.image);
      if (img) {
        var im = make("img"); im.src = img; im.alt = ""; im.loading = "lazy";
        card.appendChild(im);
      }
      var body = make("div", "offer-body");
      if (i.badge) body.appendChild(make("span", "badge", i.badge));
      body.appendChild(make("h3", "", i.title));
      if (i.text) body.appendChild(make("p", "", i.text));
      var href = i.button_link ? resolveLink(i.button_link, "Hello! I'm interested in: " + i.title) : "";
      if (href) {
        var a = make("a", "button button-gold", i.button_text || "Learn more");
        a.href = href;
        if (/^https?:/i.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
        body.appendChild(a);
      }
      card.appendChild(body);
      grid.appendChild(card);
    });
  }

  /* ---------- Services ---------- */
  function renderServices(d) {
    setText("servicesTitle", d.section_title);
    setText("servicesText", d.section_text);
    var grid = $("serviceGrid");
    (d.items || []).forEach(function (s) {
      var c = make("article", "service-card");
      c.appendChild(make("div", "service-icon", s.icon || "✦"));
      c.appendChild(make("h3", "", s.title));
      c.appendChild(make("p", "", s.text));
      grid.appendChild(c);
    });
  }

  /* ---------- Portfolio ---------- */
  function renderWork(d) {
    setText("workTitle", d.section_title);
    setText("workText", d.section_text);
    var items = d.items || [];
    var grid = $("workGrid"), filters = $("filters");
    var cats = [];
    items.forEach(function (i) { if (i.category && cats.indexOf(i.category) < 0) cats.push(i.category); });

    function draw(cat) {
      grid.textContent = "";
      items.filter(function (i) { return cat === "All" || i.category === cat; }).forEach(function (i) {
        var card = make("article", "work-card");
        var img = safeImage(i.image);
        if (img) { var im = make("img"); im.src = img; im.alt = ""; im.loading = "lazy"; card.appendChild(im); }
        var body = make("div", "work-body");
        var meta = make("div", "work-meta");
        if (i.category) meta.appendChild(make("span", "", i.category));
        if (i.status) meta.appendChild(make("span", "status", i.status));
        body.appendChild(meta);
        body.appendChild(make("h3", "", i.title));
        if (i.text) body.appendChild(make("p", "", i.text));
        var href = safeLink(i.link);
        if (href) {
          var a = make("a", "card-link", "View project →");
          a.href = href;
          if (/^https?:/i.test(href)) { a.target = "_blank"; a.rel = "noopener"; }
          body.appendChild(a);
        }
        card.appendChild(body);
        grid.appendChild(card);
      });
    }

    if (cats.length > 1) {
      ["All"].concat(cats).forEach(function (c, idx) {
        var b = make("button", "filter" + (idx === 0 ? " active" : ""), c);
        b.type = "button";
        b.addEventListener("click", function () {
          Array.prototype.forEach.call(filters.children, function (x) { x.classList.remove("active"); });
          b.classList.add("active");
          draw(c);
        });
        filters.appendChild(b);
      });
    } else { filters.hidden = true; }
    draw("All");
  }

  /* ---------- About ---------- */
  function renderAbout(d) {
    setText("aboutEyebrow", d.eyebrow);
    setText("aboutHeading", d.heading);
    setText("aboutText", d.text);
    var card = $("aboutCard");
    var photo = safeImage(d.photo);
    if (photo) {
      var im = make("img"); im.src = photo; im.alt = d.heading || "Founder"; card.appendChild(im);
    } else {
      card.classList.add("monogram");
      card.appendChild(make("span", "", d.monogram || "HN"));
    }
    var ul = $("aboutSkills");
    (d.skills || []).forEach(function (s) { ul.appendChild(make("li", "", typeof s === "string" ? s : s.name)); });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = $("menuToggle"), nav = $("nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
  });

  /* ---------- Go ---------- */
  Promise.all(["settings", "home", "adverts", "services", "portfolio", "about"].map(load)).then(function (r) {
    S = r[0];
    renderSettings();
    renderHome(r[1]);
    renderAdverts(r[2]);
    renderServices(r[3]);
    renderWork(r[4]);
    renderAbout(r[5]);
  });
})();
