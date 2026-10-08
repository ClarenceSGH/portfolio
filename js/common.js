/* ==========================================================
   Code partagé par toutes les pages :
   scroll fluide (Lenis), navigation, apparitions au scroll,
   chargement des images, copie de l'adresse e-mail.
   ========================================================== */
(function () {
  var root = document.documentElement;
  // Animations complètes quand le script du <head> a posé .motion (toujours le cas).
  var reduce = !root.classList.contains("motion");
  var hasGsap = !!(window.gsap && window.ScrollTrigger);

  // Sans GSAP, on affiche tout directement.
  if (!hasGsap) root.classList.remove("js");
  else {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  var PF = (window.PF = { reduce: reduce, hasGsap: hasGsap, animate: hasGsap && !reduce, lenis: null });

  /* Échappe le texte avant de l'insérer dans le HTML */
  PF.esc = function (str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* Typographie française
     - petits mots (articles, déterminants, prépositions…) et nombres liés au mot suivant
       par une espace insécable : jamais seuls en fin de ligne (« Quatre gestes, / une prise ») ;
     - espace insécable avant : ; ! ? » et après «, et avant un tiret.
     full = false : seulement la ponctuation (pour les paragraphes). */
  var PETITS = "à|a|au|aux|avec|ce|ces|cet|cette|chez|d'|dans|de|des|du|elle|elles|en|entre|et|il|ils|je|j'|l'|la|le|les|leur|leurs|ma|mes|mon|ne|n'|ni|nos|notre|on|ou|où|par|pour|qu'|que|qui|s'|sa|sans|se|ses|son|sous|sur|ta|tes|ton|tu|un|une|vers|vos|votre|y|chaque|plusieurs|quelques|tout|toute|tous|toutes|aucun|aucune|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|cent|mille|\\d+(?:[.,]\\d+)?";
  var reCourt = new RegExp("(^|[\\s\\u00a0'’(«])(" + PETITS + ") (?=\\S)", "giu");
  PF.typo = function (text, full) {
    var t = String(text)
      .replace(/ ([:;!?»])/g, " $1")
      .replace(/« /g, "« ")
      .replace(/ ([–—]) /g, " $1 ")
      .replace(/Nantes Atlantique/g, "Nantes Atlantique"); // un nom propre ne se coupe pas
    if (full === false) return t;
    for (var i = 0, prev; i < 4 && prev !== t; i++) { prev = t; t = t.replace(reCourt, "$1$2 "); }
    return t;
  };

  // Applique la règle aux textes déjà dans la page (titres : règle complète ; paragraphes : ponctuation)
  var TITRES = "h1, h2, h3, .about__statement, .quote__text, .learning, .statement, .case__summary, .next__title, .panel__title";
  var TEXTES = "p, li, dd, dt, figcaption, blockquote, time";
  PF.typoFix = function (scope) {
    scope = scope || document;
    [[TITRES, true], [TEXTES, false]].forEach(function (pair) {
      scope.querySelectorAll(pair[0]).forEach(function (el) {
        var walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        var node;
        while ((node = walk.nextNode())) {
          var full = pair[1] || !!(node.parentNode.closest && node.parentNode.closest(TITRES));
          var v = PF.typo(node.nodeValue, full);
          if (v !== node.nodeValue) node.nodeValue = v;
        }
      });
    });
  };

  /* Découpe un titre en mots animables */
  PF.words = function (text) {
    // les mots liés par une espace insécable restent ensemble
    return PF.typo(text)
      .split(" ")
      .map(function (w) { return '<span class="w"><span>' + PF.esc(w) + "</span></span>"; })
      .join(" ");
  };

  /* Scroll fluide */
  function initSmoothScroll() {
    if (!PF.animate || !window.Lenis) return;
    var lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
    PF.lenis = lenis;

    // Liens internes (#projets, #contact...) avec le même scroll fluide
    document.addEventListener("click", function (e) {
      var link = e.target.closest('a[href^="#"]');
      if (!link || link.classList.contains("skip")) return;
      var hash = link.getAttribute("href");
      // la page peut gérer elle-même certains liens (ex. navigation par étapes)
      if (PF.anchorHandler && PF.anchorHandler(hash)) {
        e.preventDefault();
        history.replaceState(null, "", hash);
        return;
      }
      var target = hash === "#top" ? 0 : document.querySelector(hash);
      if (target === null) return;
      e.preventDefault();
      PF.scrollTo(target);
      history.replaceState(null, "", hash);
    });
  }

  /* Défilement automatique ; PF.autoScrolling permet aux autres
     scripts de savoir qu'un défilement programmé est en cours. */
  PF.autoScrolling = false;
  PF.scrollTo = function (target, options) {
    if (!PF.lenis) {
      var y = typeof target === "number" ? target : target.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
      return;
    }
    PF.autoScrolling = true;
    PF.lenis.scrollTo(target, Object.assign({ duration: 1.4, force: true }, options, {
      onComplete: function () { PF.autoScrolling = false; },
    }));
  };

  /* Barre de navigation : prend un fond dès qu'on scrolle */
  function initNav() {
    var nav = document.querySelector("[data-nav]");
    if (!nav) return;
    if (!hasGsap) { nav.classList.add("is-solid"); return; }
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: function (self) {
        var at = PF.navSolidAt ? PF.navSolidAt() : 40;
        nav.classList.toggle("is-solid", self.scroll() > at);
      },
    });
  }

  /* Éléments [data-reveal] qui apparaissent en entrant dans l'écran */
  PF.initReveals = function () {
    if (!PF.animate) return;
    ScrollTrigger.batch("[data-reveal]:not(.is-revealed)", {
      start: "top 88%",
      once: true,
      onEnter: function (batch) {
        batch.forEach(function (el) { el.classList.add("is-revealed"); });
        gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.08 });
      },
    });
  };

  /* Images : état de chargement puis fondu, ou message d'erreur */
  PF.watchImages = function (scope) {
    (scope || document).querySelectorAll(".media img").forEach(function (img) {
      var box = img.closest(".media");
      function done() { img.classList.add("is-loaded"); box.classList.add("is-loaded"); }
      function fail() { box.classList.add("is-error"); }
      if (img.complete && img.naturalWidth) done();
      else if (img.complete) fail();
      else {
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", fail, { once: true });
      }
    });
  };

  /* Bouton « Copier l'adresse » */
  function initCopyEmail() {
    var btn = document.querySelector("[data-copy-email]");
    var link = document.querySelector("[data-email]");
    if (!btn || !link) return;
    var label = btn.querySelector("[data-copy-label]");
    var icon = btn.querySelector("i");
    var initial = label.textContent;
    var timer;
    label.setAttribute("aria-live", "polite");

    btn.addEventListener("click", function () {
      var email = link.textContent.trim();
      var copy = navigator.clipboard ? navigator.clipboard.writeText(email) : Promise.reject();
      copy
        .then(function () { show("Adresse copiée", "ph-check"); })
        .catch(function () { show("Copie impossible", "ph-warning"); });
    });

    function show(text, iconClass) {
      clearTimeout(timer);
      label.textContent = text;
      icon.className = "ph " + iconClass;
      timer = setTimeout(function () {
        label.textContent = initial;
        icon.className = "ph ph-copy";
      }, 2200);
    }
  }

  /* ---------- Appareils : iPhone, MacBook, écran tactile ----------
     PF.device("iphone" | "mac" | "screen" | "free", src, alt, options)
     options.media : fondu au chargement ; options.pos : cadrage de l'image ;
     options.scroll : part de l'écran qui défile pendant le recadrage (accueil) ;
     options.mask : masque de transparence (image détourée) */
  PF.device = function (type, src, alt, opts) {
    opts = opts || {};
    var style = (opts.pos ? "object-position:" + PF.esc(opts.pos) + ";" : "") +
      // masque de transparence (image détourée livrée en JPEG + masque PNG, bien plus léger qu'un PNG)
      (opts.mask ? "-webkit-mask-image:url(" + PF.esc(opts.mask) + ");mask-image:url(" + PF.esc(opts.mask) + ");" : "");
    var img = '<img src="' + PF.esc(src) + '" alt="' + PF.esc(alt || "") + '"' +
      (style ? ' style="' + style + '"' : "") +
      (opts.lazy ? ' loading="lazy"' : "") +
      (opts.scroll ? ' data-scroll="' + Number(opts.scroll) + '"' : "") + ' decoding="async">';
    var screen = '<div class="device__screen' + (opts.media ? " media" : "") + '">' + img + "</div>";
    if (type === "iphone") {
      return '<div class="device device--iphone"><div class="iphone">' + screen +
        '<span class="iphone__island" aria-hidden="true"></span></div></div>';
    }
    if (type === "mac") {
      return '<div class="device device--mac"><div class="mac"><div class="mac__lid">' + screen +
        '<span class="mac__notch" aria-hidden="true"></span></div><div class="mac__base" aria-hidden="true"></div></div></div>';
    }
    if (type === "screen") return '<div class="device device--screen"><div class="display">' + screen + "</div></div>";
    return '<div class="device device--free">' + img + "</div>"; // image détourée (ex. la borne)
  };

  /* ---------- Scènes : les appareils d'une couverture ----------
     Chaque projet décrit dans "scene" la place de ses appareils pour trois
     formats de cadre (large, carré, haut). Quand le cadre change de forme
     (recadrage au scroll, téléphone…), on choisit le format le plus proche
     et les appareils se réorganisent pour rester entiers. */
  var CANVAS = { wide: [1600, 1000], narrow: [1000, 1000], tall: [600, 1000] };

  function sceneData(el) {
    var slug = el.getAttribute("data-scene");
    var p = (window.PROJECTS || []).filter(function (x) { return x.slug === slug; })[0];
    return p && p.scene;
  }

  PF.scene = function (p, extraClass) {
    var items = p.scene.items
      .map(function (it, i) {
        return '<div class="scene__item" data-i="' + i + '">' + PF.device(it.device, it.src, "", { scroll: it.scroll, mask: it.mask }) + "</div>";
      })
      .join("");
    return '<div class="scene ' + (extraClass || "") + '" data-scene="' + PF.esc(p.slug) + '" style="background:' +
      PF.esc(p.scene.bg) + ";--glow:" + PF.esc(p.scene.glow || "transparent") + '">' +
      '<div class="scene__glow"></div>' + items + "</div>";
  };

  // Cadre visible dans la scène : entier, ou une fraction (recadrage)
  PF.sceneRect = function (el, fw, fh) {
    return { x: 0, y: 0, w: el.clientWidth * (fw || 1), h: el.clientHeight * (fh || 1) };
  };

  // Position de chaque appareil (centre, largeur, rotation) dans un cadre donné
  PF.scenePlan = function (el, rect) {
    var data = sceneData(el);
    var ar = rect.w / Math.max(1, rect.h), name = "wide", best = Infinity;
    Object.keys(CANVAS).forEach(function (k) {
      var d = Math.abs(Math.log(ar / (CANVAS[k][0] / CANVAS[k][1])));
      if (d < best) { best = d; name = k; }
    });
    var cv = CANVAS[name];
    var s = Math.min(rect.w / cv[0], rect.h / cv[1]);
    var ox = rect.x + (rect.w - cv[0] * s) / 2, oy = rect.y + (rect.h - cv[1] * s) / 2;
    return {
      glow: { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2, size: Math.max(rect.w, rect.h) * 1.15 },
      items: data.items.map(function (it) {
        var st = it[name] || it.wide;
        return { x: ox + st[0] * s, y: oy + st[1] * s, w: st[2] * s, r: st[3] || 0 };
      }),
    };
  };

  // Fixe la taille de base des appareils (la plus grande des deux mises en page),
  // pour qu'ils ne soient jamais agrandis au-delà de leur taille nette.
  PF.sceneSize = function (el, rects) {
    var plans = rects.map(function (r) { return PF.scenePlan(el, r); });
    var items = el.querySelectorAll(".scene__item");
    items.forEach(function (node, i) {
      var w = Math.max.apply(null, plans.map(function (pl) { return pl.items[i].w; }));
      node.style.width = Math.max(1, Math.round(w)) + "px";
      node._base = Math.max(1, Math.round(w));
    });
    var glow = el.querySelector(".scene__glow");
    var g = Math.max.apply(null, plans.map(function (pl) { return pl.glow.size; }));
    glow.style.width = glow.style.height = Math.round(g) + "px";
    glow._base = Math.round(g);
    el.classList.add("is-laid");
  };

  // Valeurs de transformation (pour GSAP) d'un appareil ou du halo dans un cadre
  PF.sceneVars = function (el, rect) {
    var plan = PF.scenePlan(el, rect);
    var items = el.querySelectorAll(".scene__item");
    var out = plan.items.map(function (it, i) {
      return { x: it.x, y: it.y, rotation: it.r, scale: it.w / (items[i]._base || it.w) };
    });
    var glow = el.querySelector(".scene__glow");
    out.glow = { x: plan.glow.x, y: plan.glow.y, scale: plan.glow.size / (glow._base || plan.glow.size) };
    return out;
  };

  // Mise en place sans animation (page projet, ou si GSAP manque)
  PF.sceneApply = function (el, rect) {
    PF.sceneSize(el, [rect]);
    var v = PF.sceneVars(el, rect);
    var tf = function (o) {
      return "translate(" + o.x + "px," + o.y + "px) translate(-50%,-50%) rotate(" + (o.rotation || 0) + "deg) scale(" + o.scale + ")";
    };
    el.querySelectorAll(".scene__item").forEach(function (node, i) { node.style.transform = tf(v[i]); });
    el.querySelector(".scene__glow").style.transform = tf(v.glow);
  };

  PF.start = function () {
    PF.typoFix();
    initSmoothScroll();
    initNav();
    initCopyEmail();
    PF.watchImages();
    PF.initReveals();
    var year = document.querySelector("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
    if (hasGsap && document.fonts) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  };
})();
