/* ==========================================================
   Page projet : construit l'étude de cas à partir de
   js/projects.js, selon l'adresse projet.html?p=<slug>
   ========================================================== */
(function () {
  var PF = window.PF;
  var esc = PF.esc;
  var projects = window.PROJECTS || [];
  var main = document.querySelector("[data-case]");
  var slug = new URLSearchParams(location.search).get("p");
  var index = projects.findIndex(function (p) { return p.slug === slug; });
  var uid = 0;

  /* ---------- petits utilitaires ---------- */

  // Couleur sombre ? (pour écrire en clair dessus)
  function isDark(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return false;
    var n = parseInt(m[1], 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return (r * 299 + g * 587 + b * 114) / 1000 < 140;
  }

  function stageAttrs(p, extra) {
    var bg = p.stage || "#e8e8e3";
    return ' class="stage ' + (extra || "") + (isDark(bg) ? " is-dark" : "") + '" style="--stage:' + esc(bg) + '"';
  }

  // Image avec ses dimensions si on les connaît (évite les sauts de mise en page)
  function img(item, attrs) {
    var size = item.w && item.h ? ' width="' + item.w + '" height="' + item.h + '"' : "";
    return '<img src="' + esc(item.src) + '" alt="' + esc(item.alt || "") + '"' + size +
      ' loading="lazy" decoding="async"' + (attrs || "") + ">";
  }

  function caption(text) {
    return text ? '<p class="stage__caption">' + esc(text) + "</p>" : "";
  }

  // En-tête de chapitre : numéro + titre à gauche, texte à droite
  function chapter(b, extra) {
    if (!b.title && !b.text) return "";
    var points = (b.points || [])
      .map(function (pt) { return "<li>" + esc(pt) + "</li>"; })
      .join("");
    return (
      '<section class="chapter">' +
        '<div class="chapter__head" data-reveal>' +
          (b.kicker ? '<span class="chapter__num">' + esc(b.kicker) + "</span>" : "") +
          "<h2>" + esc(b.title || "") + "</h2>" +
        "</div>" +
        '<div class="chapter__body">' +
          (b.text ? '<p class="case__text" data-reveal>' + esc(b.text) + "</p>" : "") +
          (points ? '<ul class="chapter__points" data-reveal>' + points + "</ul>" : "") +
          (extra || "") +
        "</div>" +
      "</section>"
    );
  }

  /* ---------- les blocs ---------- */

  var blocks = {
    text: function (b) { return chapter(b); },

    statement: function (b) {
      return '<p class="statement heading" data-reveal>' + esc(b.text) + "</p>";
    },

    phones: function (b, p) {
      var items = b.items
        .map(function (it, i) {
          return (
            '<li class="phones__item" data-reveal>' +
              PF.device("iphone", it.src, it.alt, { media: true, lazy: true, pos: it.pos }) +
              (it.label ? '<p class="phones__label"><span>' + (i + 1) + "</span>" + esc(it.label) + "</p>" : "") +
            "</li>"
          );
        })
        .join("");
      return (
        "<div" + stageAttrs(p, "stage--phones") + ">" +
          '<ol class="phones" style="--n:' + b.items.length + '">' + items + "</ol>" +
        "</div>" + caption(b.caption)
      );
    },

    // MacBook et iPhone côte à côte : leurs écrans défilent pendant le scroll
    scroll: function (b, p) {
      var items = b.items
        .map(function (it) {
          var type = it.device === "iphone" ? "iphone" : "mac";
          return '<figure class="showcase__item showcase__item--' + type + '" data-reveal>' +
            PF.device(type, it.src, it.alt, { media: true, lazy: true }) + "</figure>";
        })
        .join("");
      return "<div" + stageAttrs(p, "stage--showcase") + '><div class="showcase">' + items + "</div></div>" + caption(b.caption);
    },

    image: function (b, p) {
      var inner = b.device
        ? PF.device(b.device, b.src, b.alt, { media: true, lazy: true })
        : '<div class="shot__media media media--natural">' + img(b) + "</div>";
      return (
        "<div" + stageAttrs(p, "stage--image") + ">" +
          '<figure class="shot' + (b.device ? " shot--device shot--" + esc(b.device) : "") + '" data-reveal' +
            (b.max ? ' style="max-width:' + Number(b.max) + 'px"' : "") + ">" + inner +
          "</figure>" +
        "</div>" + caption(b.caption)
      );
    },

    pair: function (b) {
      // colonnes proportionnelles aux images : elles ont la même hauteur
      var cols = b.items
        .map(function (it) { return it.w && it.h ? (it.w / it.h).toFixed(3) + "fr" : "1fr"; })
        .join(" ");
      var items = b.items
        .map(function (it) {
          return (
            '<figure class="pair__item" data-reveal>' +
              '<div class="media media--natural">' + img(it) + "</div>" +
              (it.caption ? "<figcaption>" + esc(it.caption) + "</figcaption>" : "") +
            "</figure>"
          );
        })
        .join("");
      return '<div class="pair" style="--cols:' + cols + '">' + items + "</div>";
    },

    split: function (b, p) {
      var points = (b.points || [])
        .map(function (pt, i) {
          return '<li data-reveal><span class="split__num">' + (i + 1) + "</span><h3>" + esc(pt[0]) + "</h3><p>" + esc(pt[1]) + "</p></li>";
        })
        .join("");
      return (
        '<section class="chapter chapter--split">' +
          '<div class="chapter__head" data-reveal>' +
            (b.kicker ? '<span class="chapter__num">' + esc(b.kicker) + "</span>" : "") +
            "<h2>" + esc(b.title) + "</h2>" +
          "</div>" +
          '<div class="split">' +
            "<div" + stageAttrs(p, "split__visual") + ' data-reveal><div class="media media--natural">' + img(b) + "</div></div>" +
            '<ol class="split__points">' + points + "</ol>" +
          "</div>" +
        "</section>"
      );
    },

    versions: function (b, p) {
      var id = "v" + ++uid;
      var tabs = b.items
        .map(function (it, i) {
          return '<button type="button" role="tab" id="' + id + "-t" + i + '" aria-controls="' + id + '-panel"' +
            ' aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '" data-version="' + i + '">' +
            esc(it.label) + "</button>";
        })
        .join("");
      var shots = b.items
        .map(function (it, i) {
          return '<div class="versions__shot media' + (i === 0 ? " is-active" : "") + '" data-shot="' + i + '">' + img(it) + "</div>";
        })
        .join("");
      var texts = b.items.map(function (it) { return it.text || ""; });
      var view = '<div class="versions__view" id="' + id + '-panel" role="tabpanel" aria-labelledby="' + id + '-t0">' + shots + "</div>";
      // device: "screen" : les versions s'affichent dans l'écran tactile
      if (b.device === "screen") view = '<div class="device device--screen versions__device"><div class="display">' + view + "</div></div>";
      return (
        chapter(b) +
        "<div" + stageAttrs(p, "stage--versions") + ">" +
          '<div class="versions" data-versions=\'' + esc(JSON.stringify(texts)) + "'>" +
            '<div class="versions__tabs" role="tablist" aria-label="' + esc(b.title || "Versions") + '">' + tabs + "</div>" +
            view +
            '<p class="versions__text" aria-live="polite">' + esc(texts[0]) + "</p>" +
          "</div>" +
        "</div>"
      );
    },

    palette: function (b) {
      var colors = (b.colors || [])
        .map(function (c) {
          return '<li class="swatch" style="--c:' + esc(c.hex) + '"><span class="swatch__chip"></span>' +
            '<span class="swatch__name">' + esc(c.name) + '</span><span class="swatch__hex">' + esc(c.hex.toUpperCase()) + "</span></li>";
        })
        .join("");
      var fonts = (b.fonts || [])
        .map(function (f) {
          var family = "font-family:'" + esc(f.family) + "',system-ui,sans-serif;font-weight:" + (f.weight || 400);
          return (
            '<div class="specimen">' +
              '<p class="specimen__role">' + esc(f.role) + " · " + esc(f.family) + "</p>" +
              '<p class="specimen__sample" style="' + family + ";font-size:" + esc(f.size || "2em") + '">' + esc(f.sample) + "</p>" +
              '<p class="specimen__glyphs" style="' + family + '">Aa Bb Cc Dd Ee Ff Gg 0123456789</p>' +
            "</div>"
          );
        })
        .join("");
      return chapter(b) +
        '<div class="palette" data-reveal>' +
          '<ul class="swatches">' + colors + "</ul>" +
          (fonts ? '<div class="specimens">' + fonts + "</div>" : "") +
        "</div>";
    },

    personas: function (b) {
      var cards = b.items
        .map(function (it) {
          return (
            '<li class="persona" data-reveal>' +
              '<span class="persona__mono" aria-hidden="true">' + esc(it.name.charAt(0)) + "</span>" +
              '<h3>' + esc(it.name) + ' <span>' + esc(it.age) + "</span></h3>" +
              '<p class="persona__role">' + esc(it.role) + "</p>" +
              '<dl class="persona__facts">' +
                "<div><dt>Attentes</dt><dd>" + esc(it.needs) + "</dd></div>" +
                (it.limits ? "<div><dt>Freins</dt><dd>" + esc(it.limits) + "</dd></div>" : "") +
              "</dl>" +
            "</li>"
          );
        })
        .join("");
      return chapter(b) + '<ul class="personas">' + cards + "</ul>";
    },

    // vue éclatée d'un écran : les calques sont dans "explode" du projet
    explode: function (b) {
      return (
        '<section class="explode explode--story" data-explode aria-label="' + esc(b.title || "") + '">' +
          '<div class="explode__pin">' +
            '<div class="explode__text">' +
              (b.kicker ? '<span class="chapter__num">' + esc(b.kicker) + "</span>" : "") +
              '<h2 class="explode__title heading">' + esc(b.title || "") + "</h2>" +
              (b.text ? '<p class="explode__lead">' + esc(b.text) + "</p>" : "") +
              '<div class="explode__infos" data-explode-infos></div>' +
            "</div>" +
            '<div class="explode__stage" data-explode-stage aria-hidden="true"></div>' +
          "</div>" +
        "</section>"
      );
    },

    columns: function (b) {
      var cols = b.items
        .map(function (c) {
          var list = (c.list || []).map(function (li) { return "<li>" + esc(li) + "</li>"; }).join("");
          return '<div class="column" data-reveal><h3>' + esc(c.title) + "</h3>" +
            (c.note ? '<p class="column__note">' + esc(c.note) + "</p>" : "") + "<ul>" + list + "</ul></div>";
        })
        .join("");
      return '<div class="offset"><div class="columns" style="--n:' + b.items.length + '">' + cols + "</div></div>";
    },
  };

  /* ---------- la page ---------- */

  function renderNotFound() {
    document.title = "Projet introuvable | Clarence Seguy-Houel";
    main.innerHTML =
      '<section class="not-found">' +
        '<h1 class="heading">Projet introuvable</h1>' +
        "<p>Ce projet n'existe pas ou a changé d'adresse. Les autres sont sur la page d'accueil.</p>" +
        '<a class="btn btn--primary" href="index.html#projets">Voir les projets</a>' +
      "</section>";
  }

  function section(title, body) {
    return (
      '<section class="case__section">' +
        "<h2 data-reveal>" + esc(title) + "</h2>" +
        "<div data-reveal>" + body + "</div>" +
      "</section>"
    );
  }

  function render(p) {
    var next = projects[(index + 1) % projects.length];
    document.title = p.title + ", étude de cas | Clarence Seguy-Houel";

    // polices du projet (pour la planche typographique)
    if (p.fonts) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?" + p.fonts + "&display=swap";
      document.head.appendChild(link);
    }

    var facts = [
      ["Cadre", p.cadre],
      ["Rôle", p.role],
      ["Outils", (p.tools || []).join(", ")],
      ["Année", /\d{4}/.test(p.year || "") ? p.year : ""],
    ]
      .filter(function (f) { return f[1]; })
      .map(function (f) { return "<div><dt>" + f[0] + "</dt><dd>" + esc(f[1]) + "</dd></div>"; })
      .join("");

    var story = (p.story || [])
      .map(function (b) { return blocks[b.t] ? blocks[b.t](b, p) : ""; })
      .join("");

    var results = (p.results || [])
      .map(function (r) { return '<li><i class="ph ph-check" aria-hidden="true"></i><span>' + esc(r) + "</span></li>"; })
      .join("");

    main.innerHTML =
      '<article class="case" style="--project:' + esc(p.accent || "var(--accent)") + '">' +
        '<header class="case__head">' +
          '<a class="back link" href="index.html#projets"><i class="ph ph-arrow-left"></i> Retour aux projets</a>' +
          '<p class="case__type">' + esc(p.type) + (p.year ? ", " + esc(p.year) : "") + "</p>" +
          '<h1 class="case__title heading">' + PF.words(p.title) + "</h1>" +
          '<div class="case__intro">' +
            '<p class="case__summary" data-reveal>' + esc(p.summary) + "</p>" +
            '<dl class="facts" data-reveal>' + facts + "</dl>" +
          "</div>" +
        "</header>" +

        '<figure class="case__cover"><div class="media">' +
          (p.scene
            ? PF.scene(p, "case__visual")
            : '<img class="case__visual" src="' + esc(p.cover) + '" alt="Aperçu du projet ' + esc(p.title) + '" decoding="async">') +
        "</div></figure>" +

        (p.context ? section("Le contexte", '<p class="case__text">' + esc(p.context) + "</p>") : "") +
        (p.problem ? section("Le défi", '<p class="case__text">' + esc(p.problem) + "</p>") : "") +

        '<div class="story">' + story + "</div>" +

        section(
          "Ce que j'en retiens",
          (results ? '<ul class="results">' + results + "</ul>" : "") +
          (p.learnings ? '<p class="learning">' + esc(p.learnings) + "</p>" : "")
        ) +

        (projects.length > 1
          ? '<a class="next" href="projet.html?p=' + encodeURIComponent(next.slug) + '">' +
              '<span class="next__inner">' +
                '<span class="next__label">Projet suivant</span>' +
                '<span class="next__title heading">' + esc(next.title) + ' <i class="ph ph-arrow-right"></i></span>' +
              "</span>" +
            "</a>"
          : "") +
      "</article>";
  }

  /* ---------- couverture en appareils : placée selon la taille du cadre ---------- */
  function initCover() {
    var sc = document.querySelector(".case__cover .scene");
    if (!sc) return;
    var lay = function () { PF.sceneApply(sc, PF.sceneRect(sc)); };
    lay();
    window.addEventListener("resize", lay);
    // les appareils s'inclinent sous la souris
    PF.tiltDevices(document.querySelector(".case__cover"));
  }

  /* ---------- versions à onglets ---------- */
  function initVersions() {
    document.querySelectorAll("[data-versions]").forEach(function (box) {
      var texts = JSON.parse(box.getAttribute("data-versions"));
      var tabs = box.querySelectorAll("[role=tab]");
      var shots = box.querySelectorAll("[data-shot]");
      var text = box.querySelector(".versions__text");
      var panel = box.querySelector("[role=tabpanel]");

      function select(i, focus) {
        tabs.forEach(function (t, j) {
          t.setAttribute("aria-selected", String(i === j));
          t.tabIndex = i === j ? 0 : -1;
        });
        shots.forEach(function (s, j) { s.classList.toggle("is-active", i === j); });
        panel.setAttribute("aria-labelledby", tabs[i].id);
        if (PF.animate) {
          gsap.fromTo(text, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
        }
        text.textContent = PF.typo(texts[i], false);
        if (focus) tabs[i].focus();
      }

      tabs.forEach(function (t, i) {
        t.addEventListener("click", function () { select(i); });
        t.addEventListener("keydown", function (e) {
          var n = tabs.length, to = null;
          if (e.key === "ArrowRight") to = (i + 1) % n;
          if (e.key === "ArrowLeft") to = (i - 1 + n) % n;
          if (e.key === "Home") to = 0;
          if (e.key === "End") to = n - 1;
          if (to !== null) { e.preventDefault(); select(to, true); }
        });
      });
    });
  }

  /* ---------- animations ---------- */
  function animate() {
    if (!PF.animate) return;
    var tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.3 } });
    tl.fromTo(".back", { opacity: 0, x: -10 }, { opacity: 1, x: 0 }, 0)
      .fromTo(".case__type", { opacity: 0, y: 10 }, { opacity: 1, y: 0 }, 0.1)
      .fromTo(".case__title .w > span", { yPercent: 110, y: 0 }, { yPercent: 0, stagger: 0.07 }, 0.15);

    // La couverture arrive inclinée et se redresse pendant le scroll
    var coverBox = document.querySelector(".case__cover .media");
    var cover = document.querySelector(".case__visual");
    if (coverBox) {
      gsap.fromTo(coverBox, { rotationX: 24, scale: 0.9, transformPerspective: 1800, transformOrigin: "50% 0%" }, {
        rotationX: 0, scale: 1, ease: "none",
        scrollTrigger: { trigger: ".case__cover", start: "top 92%", end: "top 22%", scrub: true },
      });
    }
    if (cover) {
      gsap.fromTo(cover, { scale: 1.08 }, {
        scale: 1, ease: "none",
        scrollTrigger: { trigger: ".case__cover", start: "top bottom", end: "bottom top", scrub: true },
      });
    }

    // Les scènes colorées s'ouvrent en entrant dans l'écran
    gsap.utils.toArray(".story .stage").forEach(function (st) {
      gsap.fromTo(st, { clipPath: "inset(6% 4% 6% 4% round 24px)" }, {
        clipPath: "inset(0% 0% 0% 0% round 24px)", ease: "none",
        scrollTrigger: { trigger: st, start: "top bottom", end: "top 45%", scrub: true },
      });
    });

    // Les écrans larges arrivent inclinés, comme posés sur une table, et se redressent
    gsap.utils.toArray(".showcase, .shot--device > .device, .versions__device").forEach(function (el) {
      gsap.fromTo(el, { rotationX: 30, y: 70, transformPerspective: 1800, transformOrigin: "50% 100%" }, {
        rotationX: 0, y: 0, ease: "none",
        scrollTrigger: { trigger: el, start: "top bottom", end: "top 35%", scrub: true },
      });
    });

    // Écrans plus longs que l'appareil (pages de site…) : l'appareil reste fixe
    // à l'écran pendant que la page défile à l'intérieur, puis la lecture reprend
    document.documentElement.classList.add("has-device-scroll");
    var navH = function () { var n = document.querySelector(".nav"); return n ? n.offsetHeight : 0; };
    gsap.utils.toArray(".story .stage--showcase, .story .stage--image").forEach(function (stage) {
      var imgs = gsap.utils.toArray(stage.querySelectorAll(".device__screen > img"));
      if (!imgs.length) return;
      var over = function (img) { return Math.max(0, img.offsetHeight - img.parentNode.clientHeight); };
      var longest = function () { return Math.max.apply(null, imgs.map(over)); };
      var tall = function () { return stage.offsetHeight > window.innerHeight - navH() - 24; };
      var tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: stage,
          start: function () { return tall() ? "top top+=" + navH() : "center center+=" + Math.round(navH() / 2); },
          end: function () { return "+=" + Math.round(longest() * 1.4); },
          pin: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });
      imgs.forEach(function (img) {
        tl.to(img, { y: function () { return -over(img); }, duration: 1 }, 0);
      });
    });

    // Les iPhone arrivent en éventail (inclinés vers le centre) et remontent en décalé
    document.querySelectorAll(".phones").forEach(function (row) {
      var phones = row.querySelectorAll(".device");
      var mid = (phones.length - 1) / 2;
      var small = window.matchMedia("(max-width: 767px)").matches;
      gsap.fromTo(phones, {
        rotationY: function (i) { return (mid - i) * (small ? 8 : 12); },
        rotationX: 14,
        transformPerspective: 1400,
      }, {
        rotationY: 0, rotationX: 0, ease: "none",
        scrollTrigger: { trigger: row, start: "top bottom", end: "top 30%", scrub: true },
      });
      if (small) return;
      // l'appareil et son étiquette bougent ensemble
      row.querySelectorAll(".phones__item").forEach(function (item, i) {
        gsap.fromTo(item.querySelectorAll(".device, .phones__label"), { y: 40 + (i % 2) * 50 }, {
          y: -(i % 2) * 30,
          ease: "none",
          scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    });
  }

  // Quand une image finit de charger, la hauteur de la page change : on recalcule les déclencheurs
  function refreshOnImages() {
    if (!PF.hasGsap) return;
    var timer;
    main.querySelectorAll("img").forEach(function (im) {
      if (im.complete) return;
      im.addEventListener("load", function () {
        clearTimeout(timer);
        timer = setTimeout(function () { ScrollTrigger.refresh(); }, 150);
      }, { once: true });
    });
  }

  if (index === -1) renderNotFound();
  else render(projects[index]);
  initCover();
  PF.start();
  if (index !== -1) {
    main.querySelectorAll("[data-explode]").forEach(function (sec) { PF.explode(sec, [{ data: projects[index].explode }]); });
  }
  initVersions();
  animate();
  refreshOnImages();
  // plusieurs blocs restent épinglés : on recalcule dans l'ordre de la page
  if (PF.hasGsap) { ScrollTrigger.sort(); ScrollTrigger.refresh(); }
})();
