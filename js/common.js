/* ==========================================================
   Code partagé par toutes les pages :
   scroll fluide (Lenis), navigation, thème clair / sombre,
   signature animée, apparitions au scroll, inclinaison 3D
   des écrans, copie de l'adresse e-mail.
   ========================================================== */
(function () {
  var root = document.documentElement;
  // Animations complètes quand le script du <head> a posé .motion (toujours le cas).
  var reduce = !root.classList.contains("motion");
  var hasGsap = !!(window.gsap && window.ScrollTrigger);
  // souris (et pas écran tactile) : effets de survol
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Sans GSAP, on affiche tout directement.
  if (!hasGsap) root.classList.remove("js", "is-loading");
  else {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
  }

  var PF = (window.PF = { reduce: reduce, hasGsap: hasGsap, animate: hasGsap && !reduce, fine: fine, lenis: null, locked: false });

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

  /* ---------- Signature (logo) ----------
     PF.signature()            : le dessin, en vert (couleur du texte courant)
     PF.signature({ draw: 1 }) : avec le masque qui permet de l'écrire au stylo
     PF.writeSignature(svg)    : animation d'écriture (timeline GSAP) */
  var sigCount = 0;
  PF.signature = function (opts) {
    opts = opts || {};
    var S = window.SIGNATURE;
    if (!S) return "";
    var n = ++sigCount;
    var ink = '<path class="sig__ink" fill="currentColor" fill-rule="evenodd" d="' + S.d + '"' +
      (opts.draw ? ' mask="url(#sig-m' + n + ')"' : "") + "/>";
    var open = '<svg class="sig" viewBox="' + S.box + '" aria-hidden="true" focusable="false">';
    if (!opts.draw) return open + ink + "</svg>";
    var pen = S.pen.map(function (stroke, i) {
      return '<g data-stroke="' + i + '">' + stroke.map(function (s) {
        return '<path d="' + s.d + '" stroke-width="' + s.w + '"/>';
      }).join("") + "</g>";
    }).join("");
    return open +
      "<defs>" +
        '<mask id="sig-m' + n + '" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="560">' +
          '<g fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round">' + pen + "</g>" +
        "</mask>" +
      "</defs>" +
      ink + "</svg>";
  };

  // Écrit la signature trait par trait : un masque révèle l'encre derrière le stylo.
  // opts.speed : vitesse (unités du dessin par seconde) ; opts.lift : pause entre deux traits ;
  // opts.unmask : à la fin, l'encre est affichée sans masque (net au pixel près).
  PF.writeSignature = function (svg, opts) {
    opts = opts || {};
    var speed = opts.speed || 1150;
    var lift = opts.lift == null ? 0.14 : opts.lift;
    var ink = svg.querySelector(".sig__ink");
    var tl = gsap.timeline({ paused: !!opts.paused });
    var groups = svg.querySelectorAll("mask [data-stroke]");
    var at = 0;
    if (ink && !ink.getAttribute("mask") && ink.getAttribute("data-mask")) ink.setAttribute("mask", ink.getAttribute("data-mask"));

    groups.forEach(function (g, gi) {
      var segs = Array.prototype.map.call(g.querySelectorAll("path"), function (p) {
        var len = p.getTotalLength();
        p.style.strokeDasharray = len + " " + (len + 40);
        p.style.strokeDashoffset = len + 20; // caché
        return { el: p, len: len };
      });
      var total = segs.reduce(function (s, x) { return s + x.len; }, 0);
      var last = gi === groups.length - 1;
      // le dernier trait (le grand trait de soulignement) part plus vite, comme un geste final
      var dur = Math.max(0.25, total / (speed * (last ? 1.6 : 1)));
      var prog = { v: 0 };
      var start = at + (gi ? lift : 0);
      tl.to(prog, {
        v: 1,
        duration: dur,
        ease: last ? "power1.in" : "sine.inOut",
        onUpdate: function () {
          var d = prog.v * total;
          segs.forEach(function (s) {
            var t = Math.max(0, Math.min(s.len, d));
            s.el.style.strokeDashoffset = t <= 0 ? s.len + 20 : s.len - t;
            d -= s.len;
          });
        },
      }, start);
      at = start + dur;
    });
    if (opts.unmask && ink) {
      tl.call(function () {
        ink.setAttribute("data-mask", ink.getAttribute("mask") || "");
        ink.removeAttribute("mask");
      });
    }
    return tl;
  };

  // Logo de la barre du haut : dessin vectoriel ; au survol, la signature se réécrit
  function initBrand() {
    document.querySelectorAll("[data-sig]").forEach(function (a) {
      a.innerHTML = PF.signature({ draw: PF.animate && fine });
      if (!PF.animate || !fine) return;
      var svg = a.querySelector("svg");
      // au départ, signature entière
      svg.querySelectorAll("mask path").forEach(function (p) { p.style.strokeDasharray = "none"; });
      var replay = null;
      a.addEventListener("mouseenter", function () {
        if (PF.locked || (replay && replay.isActive())) return;
        replay = PF.writeSignature(svg, { speed: 2600, lift: 0.04 });
      });
    });
  }

  /* Thème clair / sombre : le choix est gardé dans le navigateur
     (le script du <head> l'applique avant l'affichage, sans flash) */
  function initTheme() {
    var btn = document.querySelector("[data-theme-toggle]");
    if (!btn) return;
    var meta = document.querySelector('meta[name="theme-color"]');
    var timer;
    function sync() {
      var dark = root.getAttribute("data-theme") === "dark";
      btn.setAttribute("aria-pressed", String(dark));
      btn.setAttribute("aria-label", dark ? "Passer au thème clair" : "Passer au thème sombre");
      if (meta) meta.setAttribute("content", dark ? "#1d1e2c" : "#ddfdfe");
    }
    sync();
    btn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.classList.add("theme-anim");
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("pf-theme", next); } catch (e) {}
      sync();
      clearTimeout(timer);
      timer = setTimeout(function () { root.classList.remove("theme-anim"); }, 500);
    });
  }

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
      if (PF.locked) { e.preventDefault(); return; }
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

  /* Menu plein écran (téléphone) : s'ouvre depuis le haut, se ferme avec Échap,
     un lien ou le bouton ; le reste de la page est mis hors d'atteinte pendant ce temps */
  function initMenu() {
    var btn = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (!btn || !menu) return;
    var outside = document.querySelectorAll("main, footer, .skip, .nav__brand, .nav__links");
    var timer;

    function open() {
      clearTimeout(timer);
      menu.hidden = false;
      menu.offsetHeight; // le navigateur pose l'état fermé avant d'animer
      menu.classList.add("is-open");
      root.classList.add("has-menu");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Fermer le menu");
      outside.forEach(function (el) { el.inert = true; });
      PF.locked = true;
      if (PF.lenis) PF.lenis.stop();
      var first = menu.querySelector("a");
      if (first) first.focus({ preventScroll: true });
    }
    function close(restoreFocus) {
      menu.classList.remove("is-open");
      root.classList.remove("has-menu");
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-label", "Ouvrir le menu");
      outside.forEach(function (el) { el.inert = false; });
      PF.locked = false;
      if (PF.lenis) PF.lenis.start();
      timer = setTimeout(function () { menu.hidden = true; }, 600);
      if (restoreFocus) btn.focus({ preventScroll: true });
    }
    PF.closeMenu = function () { if (!menu.hidden) close(false); };

    btn.addEventListener("click", function () {
      if (btn.getAttribute("aria-expanded") === "true") close(true);
      else open();
    });
    // un lien : on ferme d'abord (la page se débloque), puis le lien fait son travail
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) close(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") close(true);
    });
    // en repassant sur grand écran, le menu n'a plus lieu d'être
    window.matchMedia("(min-width: 768px)").addEventListener("change", function (m) {
      if (m.matches) PF.closeMenu();
    });
  }

  /* La barre du haut surligne la section affichée (accueil) */
  PF.initSpy = function () {
    var links = document.querySelectorAll("[data-spy]");
    if (!links.length || !hasGsap) return;
    function set(id) {
      links.forEach(function (a) {
        if (a.getAttribute("data-spy") === id) a.setAttribute("aria-current", "location");
        else a.removeAttribute("aria-current");
      });
    }
    links.forEach(function (a, i) {
      var id = a.getAttribute("data-spy");
      var section = document.getElementById(id);
      if (!section) return;
      ScrollTrigger.create({
        trigger: section,
        start: "top 55%",
        // la dernière section reste surlignée jusqu'en bas de la page
        end: i === links.length - 1 ? "max" : "bottom 55%",
        onToggle: function (self) {
          if (self.isActive) set(id);
          else if (a.hasAttribute("aria-current")) set(null);
        },
      });
    });
  };

  /* Page projet : barre de progression de lecture */
  function initProgress() {
    if (!document.querySelector("[data-case]") || !PF.animate) return;
    var bar = document.createElement("div");
    bar.className = "progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);
    gsap.to(bar, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.3 },
    });
  }

  /* Éléments [data-reveal] qui apparaissent en entrant dans l'écran */
  PF.initReveals = function () {
    if (!PF.animate) return;
    ScrollTrigger.batch("[data-reveal]:not(.is-revealed)", {
      start: "top 88%",
      once: true,
      onEnter: function (batch) {
        // après un saut (lien, retour), ce qui est déjà passé au-dessus s'affiche tout de suite
        var shown = [], past = [];
        batch.forEach(function (el) {
          el.classList.add("is-revealed");
          (el.getBoundingClientRect().bottom < 0 ? past : shown).push(el);
        });
        if (past.length) gsap.set(past, { opacity: 1, y: 0 });
        if (shown.length) gsap.to(shown, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out", stagger: Math.min(0.07, 0.42 / shown.length) });
      },
    });
    // titres découpés en lignes qui montent
    gsap.utils.toArray("[data-split-lines]").forEach(function (el) {
      gsap.fromTo(el.querySelectorAll(".line > span"), { yPercent: 110, y: 0 }, {
        yPercent: 0, duration: 1.3, ease: "expo.out", stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 85%", once: true },
      });
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

  /* ---------- Effets de souris (ordinateur seulement) ---------- */

  // Inclinaison des appareils d'une scène selon la position de la souris dans "area"
  PF.tiltDevices = function (area, scope) {
    if (!fine || !PF.animate || !area) return;
    var devices = (scope || area).querySelectorAll(".scene__item > .device");
    if (!devices.length) return;
    var target = { x: 0, y: 0 }, cur = { x: 0, y: 0 }, running = false;
    function tick() {
      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      devices.forEach(function (d) {
        d.style.setProperty("--mx", cur.x.toFixed(4));
        d.style.setProperty("--my", cur.y.toFixed(4));
        d.style.setProperty("--sheen", (60 - cur.x * 30).toFixed(1) + "%");
      });
      if (Math.abs(target.x - cur.x) + Math.abs(target.y - cur.y) > 0.001) requestAnimationFrame(tick);
      else running = false;
    }
    function go() { if (!running) { running = true; requestAnimationFrame(tick); } }
    area.addEventListener("pointermove", function (e) {
      var r = area.getBoundingClientRect();
      target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      go();
    });
    area.addEventListener("pointerleave", function () { target.x = 0; target.y = 0; go(); });
  };

  // Image inclinée en 3D sous la souris [data-tilt]
  function initTilt() {
    if (!fine || !PF.animate) return;
    document.querySelectorAll("[data-tilt]").forEach(function (box) {
      var el = box.firstElementChild;
      gsap.set(el, { transformPerspective: 1100 });
      var rx = gsap.quickTo(el, "rotationX", { duration: 0.8, ease: "power3.out" });
      var ry = gsap.quickTo(el, "rotationY", { duration: 0.8, ease: "power3.out" });
      box.addEventListener("pointermove", function (e) {
        var r = box.getBoundingClientRect();
        ry(((e.clientX - r.left) / r.width - 0.5) * 14);
        rx(-((e.clientY - r.top) / r.height - 0.5) * 12);
      });
      box.addEventListener("pointerleave", function () { rx(0); ry(0); });
    });
  }

  /* Pied de page : la grande signature s'écrit quand elle arrive à l'écran
     (et se réécrit si l'on remonte puis redescend) */
  function initFooterSig() {
    var box = document.querySelector("[data-footer-sig]");
    if (!box) return;
    box.innerHTML = PF.signature({ draw: PF.animate });
    if (!PF.animate) return;
    var tl = PF.writeSignature(box.querySelector("svg"), { paused: true, speed: 900 });
    ScrollTrigger.create({
      trigger: box,
      start: "top 70%",
      onEnter: function () { tl.restart(); },
      onLeaveBack: function () { tl.pause(0); },
    });
  }

  /* ---------- Appareils : iPhone, MacBook, écran tactile ----------
     PF.device("iphone" | "mac" | "screen" | "free", src, alt, options)
     options.media : fondu au chargement ; options.pos : cadrage de l'image ;
     options.scroll : part de l'écran qui défile pendant le recadrage (accueil) ;
     options.mask : masque de transparence (image détourée) ;
     options.tilt : [inclinaison avant/arrière, inclinaison gauche/droite] en degrés */
  PF.device = function (type, src, alt, opts) {
    opts = opts || {};
    var style = (opts.pos ? "object-position:" + PF.esc(opts.pos) + ";" : "") +
      // masque de transparence (image détourée livrée en JPEG + masque PNG, bien plus léger qu'un PNG)
      (opts.mask ? "-webkit-mask-image:url(" + PF.esc(opts.mask) + ");mask-image:url(" + PF.esc(opts.mask) + ");" : "");
    var img = '<img src="' + PF.esc(src) + '" alt="' + PF.esc(alt || "") + '"' +
      (style ? ' style="' + style + '"' : "") +
      (opts.lazy ? ' loading="lazy"' : "") +
      (opts.scroll ? ' data-scroll="' + Number(opts.scroll) + '"' : "") + ' decoding="async">';
    var tilt = opts.tilt ? ' style="--rx:' + Number(opts.tilt[0]) + "deg;--ry:" + Number(opts.tilt[1]) + 'deg"' : "";
    var screen = '<div class="device__screen' + (opts.media ? " media" : "") + '">' + img + "</div>";
    if (type === "iphone") {
      return '<div class="device device--iphone"' + tilt + '><div class="iphone">' + screen +
        '<span class="iphone__island" aria-hidden="true"></span></div></div>';
    }
    if (type === "mac") {
      return '<div class="device device--mac"' + tilt + '><div class="mac"><div class="mac__lid">' + screen +
        '<span class="mac__notch" aria-hidden="true"></span></div><div class="mac__base" aria-hidden="true"></div></div></div>';
    }
    if (type === "screen") return '<div class="device device--screen"' + tilt + '><div class="display">' + screen + "</div></div>";
    return '<div class="device device--free"' + tilt + ">" + img + "</div>"; // image détourée (ex. la borne)
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
        return '<div class="scene__item" data-i="' + i + '">' +
          PF.device(it.device, it.src, "", { scroll: it.scroll, mask: it.mask, tilt: it.tilt }) + "</div>";
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
    initBrand();
    initNav();
    initMenu();
    initCopyEmail();
    PF.watchImages();
    PF.initReveals();
    initTheme();
    initTilt();
    initFooterSig();
    initProgress();
    var year = document.querySelector("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
    if (hasGsap && document.fonts) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  };
})();
