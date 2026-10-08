/* ==========================================================
   Page d'accueil
   1. Arrivée : le logo seul. Au premier scroll, il s'envole jusqu'à
      la barre du haut et ton prénom se déroule à partir de lui.
   2. Projets empilés : chaque projet arrive en plein cadre, puis le scroll
      recadre l'image et fait apparaître ses détails, avant le suivant.
   3. Citations écrites au fil du scroll.
   ========================================================== */
(function () {
  var PF = window.PF;
  var esc = PF.esc;
  var projects = window.PROJECTS || [];

  /* ---------- Projets ---------- */
  function renderProjects() {
    var stack = document.querySelector("[data-stack]");

    if (!projects.length) {
      stack.innerHTML =
        '<p class="panel__summary" style="padding:20vh var(--gutter)">Aucun projet pour le moment. Ajoute-les dans js/projects.js.</p>';
      return;
    }

    stack.innerHTML = projects
      .map(function (p, i) {
        var url = "projet.html?p=" + encodeURIComponent(p.slug);
        return (
          '<article class="panel" style="--i:' + i + '">' +
            '<div class="panel__inner">' +
              '<div class="panel__stage">' +
                '<a class="panel__media media" href="' + url + '" tabindex="-1" aria-hidden="true" data-project-link>' +
                  (p.scene
                    // couverture en appareils (iPhone, MacBook…) qui se réorganisent au recadrage
                    ? '<div class="panel__media-inner panel__media-inner--scene">' + PF.scene(p, "panel__visual") + "</div>"
                    : '<div class="panel__media-inner"><img class="panel__visual" src="' + esc(p.cover) + '" alt="" ' +
                      (i === 0 ? "" : 'loading="lazy" ') + 'decoding="async"></div>') +
                "</a>" +
                '<div class="panel__details">' +
                  '<p class="panel__meta">' + esc(p.type) + ", " + esc(p.year) + "</p>" +
                  '<p class="panel__summary">' + esc(p.summary) + "</p>" +
                  '<dl class="panel__facts">' +
                    "<div><dt>Rôle</dt><dd>" + esc(p.role) + "</dd></div>" +
                    "<div><dt>Cadre</dt><dd>" + esc(p.cadre) + "</dd></div>" +
                    "<div><dt>Outils</dt><dd>" + esc((p.tools || []).join(", ")) + "</dd></div>" +
                  "</dl>" +
                  '<a class="btn btn--primary" href="' + url + '" data-project-link>Voir l\'étude de cas <i class="ph ph-arrow-right"></i></a>' +
                "</div>" +
              "</div>" +
              '<h3 class="panel__title heading">' + PF.words(p.title) + "</h3>" +
              '<div class="panel__veil"></div>' +
            "</div>" +
          "</article>"
        );
      })
      .join("");

    // Transition « morphing » de l'image vers la page projet
    stack.addEventListener("click", function (e) {
      var link = e.target.closest("[data-project-link]");
      if (!link) return;
      link.closest(".panel").querySelector(".panel__visual").style.viewTransitionName = "project-cover";
    });
    window.addEventListener("pageshow", function () {
      stack.querySelectorAll(".panel__visual").forEach(function (v) { v.style.viewTransitionName = ""; });
    });
  }

  /* ---------- 1. Arrivée : le logo seul ---------- */
  function splitLetters(el) {
    el.innerHTML = Array.from(el.textContent)
      .map(function (c) { return '<span class="ch">' + esc(c) + "</span>"; })
      .join("");
    el.style.transform = "none";
    return el.querySelectorAll(".ch");
  }

  function initIntro() {
    var intro = document.querySelector(".intro");
    var logo = document.querySelector("[data-intro-logo]");
    var brand = document.querySelector(".nav__brand");
    if (!intro || !logo || !brand || !PF.hasGsap) return;
    var lists = document.querySelectorAll(".nav__list");
    var navLogo = brand.querySelector(".brand__logo");

    // Animations réduites : la barre apparaît en fondu, sans mouvement
    if (!PF.animate) {
      var fade = gsap.timeline({ paused: true })
        .fromTo([brand, lists], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: "power1.out" });
      ScrollTrigger.create({
        trigger: intro,
        start: "top+=8 top",
        onEnter: function () { fade.play(); },
        onLeaveBack: function () { fade.reverse(); },
      });
      if (window.scrollY > 8) fade.progress(1);
      return;
    }

    document.documentElement.classList.add("has-float");
    var letters = splitLetters(brand.querySelector(".mask > span"));

    function centre() {
      return {
        x: (document.documentElement.clientWidth - logo.offsetWidth) / 2,
        y: (intro.offsetHeight - logo.offsetHeight) / 2,
      };
    }
    function dock() {
      var r = navLogo.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - logo.offsetWidth / 2,
        y: r.top + r.height / 2 - logo.offsetHeight / 2,
        scale: r.width / logo.offsetWidth,
      };
    }

    // Animation jouée dans le temps (et non collée au scroll) : toujours fluide.
    var flight = gsap.timeline({
      paused: true,
      onStart: function () { logo.classList.add("is-flying"); },
      onReverseComplete: function () { logo.classList.remove("is-flying"); },
    });
    flight
      .fromTo(logo,
        { x: function () { return centre().x; }, y: function () { return centre().y; }, scale: 1, rotation: 0 },
        {
          x: function () { return dock().x; },
          y: function () { return dock().y; },
          scale: function () { return dock().scale; },
          rotation: 360,
          duration: 1.25,
          ease: "expo.inOut",
        }, 0)
      // le trait s'épaissit en rapetissant, pour rester lisible dans la barre
      .fromTo(logo.querySelector(".brand__logo-bold"), { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "none" }, 0.6)
      .fromTo(logo.querySelector(".brand__logo-thin"), { opacity: 1 }, { opacity: 0, duration: 0.45, ease: "none" }, 0.6)
      // le prénom se déroule lettre par lettre, en partant du logo
      .fromTo(letters,
        { yPercent: 120, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.8, ease: "expo.out", stagger: { each: 0.045, from: "end" } }, 1.0)
      .fromTo(lists, { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.out" }, 1.05);

    ScrollTrigger.create({
      trigger: intro,
      start: "top+=8 top",
      onEnter: function () { flight.timeScale(1).play(); },
      onLeaveBack: function () { flight.timeScale(1.3).reverse(); },
    });
    if (window.scrollY > 8) flight.progress(1);

    // Au redimensionnement, on recalcule le point d'arrivée
    ScrollTrigger.addEventListener("refresh", function () {
      var p = flight.progress();
      flight.progress(0).invalidate().progress(p);
    });

    PF.navSolidAt = function () { return intro.offsetHeight * 0.95; };

    // Clic sur le logo : vers les projets depuis l'accueil, sinon retour en haut
    logo.addEventListener("click", function () {
      var toProjects = window.scrollY < intro.offsetHeight / 2;
      if (PF.goToStep) PF.goToStep(toProjects ? 1 : 0);
      else PF.scrollTo(toProjects ? intro.offsetHeight : 0, { duration: 1.5 });
    });

    // Apparition du logo à l'arrivée sur le site
    gsap.fromTo(logo.querySelector(".brand__logo"),
      { scale: 0, rotation: -120 },
      { scale: 1, rotation: 0, duration: 1.6, ease: "expo.out", delay: 0.15, clearProps: "transform" });

    return flight;
  }

  /* ---------- 2. Pile de projets avec détails ---------- */
  function initStack() {
    var stack = document.querySelector("[data-stack]");
    var panels = gsap.utils.toArray(".panel");
    if (!PF.animate || !panels.length) return null;
    document.documentElement.classList.add("has-stack");

    var mobile = function () { return window.matchMedia("(max-width: 767px)").matches; };
    var FULL = "inset(0% 0% 0% 0% round 12px)";
    var cropped = function () {
      return mobile() ? "inset(0% 0% 44% 0% round 12px)" : "inset(0% 41% 0% 0% round 12px)";
    };
    var details = function (p) { return p.querySelectorAll(".panel__details > *"); };

    // Couvertures en appareils : partie visible du cadre, entier puis recadré
    // (mêmes proportions que le clip-path ci-dessus)
    var scenes = panels.map(function (p) { return p.querySelector(".scene"); });
    var fullRect = function (sc) { return PF.sceneRect(sc); };
    var cropRect = function (sc) { return mobile() ? PF.sceneRect(sc, 1, 0.56) : PF.sceneRect(sc, 0.59, 1); };
    function sizeScenes() {
      scenes.forEach(function (sc) { if (sc) PF.sceneSize(sc, [fullRect(sc), cropRect(sc)]); });
    }
    function sceneState(sc, rectFn, extra) {
      var get = function (j, key) { return PF.sceneVars(sc, rectFn(sc))[j][key]; };
      return Object.assign({
        x: function (j) { return get(j, "x"); },
        y: function (j) { return get(j, "y"); },
        rotation: function (j) { return get(j, "rotation"); },
        scale: function (j) { return get(j, "scale"); },
      }, extra);
    }
    function glowState(sc, rectFn, extra) {
      var get = function (key) { return PF.sceneVars(sc, rectFn(sc)).glow[key]; };
      return Object.assign({
        x: function () { return get("x"); },
        y: function () { return get("y"); },
        scale: function () { return get("scale"); },
      }, extra);
    }
    // écran qui défile un peu pendant le recadrage (ex. le site dans le MacBook)
    function screenScroll(img) {
      var screen = img.parentNode;
      return -Math.max(0, img.offsetHeight - screen.clientHeight) * parseFloat(img.getAttribute("data-scroll"));
    }
    sizeScenes();
    ScrollTrigger.addEventListener("refreshInit", sizeScenes);
    scenes.forEach(function (sc) {
      if (sc) gsap.set(sc.querySelectorAll(".scene__item, .scene__glow"), { xPercent: -50, yPercent: -50, x: 0, y: 0 });
    });

    // Départ : images en plein cadre, détails cachés, projets suivants sous l'écran
    panels.forEach(function (p, i) {
      gsap.set(p.querySelector(".panel__media"), { clipPath: FULL });
      gsap.set(p.querySelector(".panel__media-inner"), { x: 0, y: 0, xPercent: 0, yPercent: 0 });
      gsap.set(details(p), { autoAlpha: 0, y: 24 });
      if (i > 0) {
        gsap.set(p, { yPercent: 100 });
        gsap.set(p.querySelector(".panel__visual"), { scale: 1.15 });
        gsap.set(p.querySelectorAll(".panel__title .w > span"), { yPercent: 110 });
      }
    });

    // Le premier projet grandit pendant que le logo s'envole
    var first = panels[0];
    gsap.fromTo(first.querySelector(".panel__inner"), { scale: 0.9 }, {
      scale: 1, ease: "none",
      scrollTrigger: { trigger: stack, start: "top bottom", end: "top top", scrub: true },
    });
    gsap.fromTo(first.querySelectorAll(".panel__title .w > span"), { yPercent: 110 }, {
      yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.06,
      scrollTrigger: { trigger: stack, start: "top 55%", toggleActions: "play none none reverse" },
    });

    // Scène épinglée : tout le reste est piloté par le scroll
    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: stack,
        start: "top top",
        end: function () { return "+=" + Math.round(tl.duration() * window.innerHeight * 0.6); },
        pin: true,
        scrub: 0.4,
        invalidateOnRefresh: true,
        refreshPriority: 1, // calculé avant les animations placées plus bas dans la page
      },
    });
    var ends = [];

    panels.forEach(function (p, i) {
      if (i > 0) {
        var prev = panels[i - 1];
        tl.addLabel("p" + i)
          .to(p, { yPercent: 0, duration: 1 }, "p" + i)
          .fromTo(prev.querySelector(".panel__inner"), { scale: 1 }, { scale: 0.94, duration: 1, immediateRender: false }, "p" + i)
          .to(prev.querySelector(".panel__veil"), { opacity: 0.8, duration: 1 }, "p" + i)
          // le titre précédent s'efface tout de suite : un seul titre lisible à la fois
          .to(prev.querySelector(".panel__title"), { autoAlpha: 0, duration: 0.3 }, "p" + i)
          .to(p.querySelector(".panel__visual"), { scale: 1, duration: 1 }, "p" + i)
          .to(p.querySelectorAll(".panel__title .w > span"),
            { yPercent: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" }, "p" + i + "+=0.5");
      }
      // les détails : l'image se recadre, les lignes apparaissent une à une
      var sc = scenes[i];
      var move = { duration: 0.8, ease: "power2.inOut" };
      tl.addLabel("d" + i)
        .to(p.querySelector(".panel__media"), { clipPath: cropped, duration: 0.8, ease: "power2.inOut" }, "d" + i);
      if (sc) {
        // les appareils se rapprochent et se réorganisent pour rester entiers dans le cadre
        tl.fromTo(sc.querySelectorAll(".scene__item"), sceneState(sc, fullRect), sceneState(sc, cropRect, move), "d" + i)
          .fromTo(sc.querySelector(".scene__glow"), glowState(sc, fullRect), glowState(sc, cropRect, move), "d" + i);
        sc.querySelectorAll("img[data-scroll]").forEach(function (img) {
          tl.fromTo(img, { y: 0 }, Object.assign({ y: function () { return screenScroll(img); } }, move), "d" + i);
        });
      } else {
        tl.to(p.querySelector(".panel__media-inner"), Object.assign({
          xPercent: function () { return mobile() ? 0 : -20.5; },
          yPercent: function () { return mobile() ? -22 : 0; },
        }, move), "d" + i);
      }
      tl.to(details(p), { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.08, ease: "power2.out" }, "d" + i + "+=0.3");
      // fin de l'étape : le projet et tous ses détails sont affichés
      ends.push(tl.duration());

      // Navigation au clavier (Tab) : on amène le projet à l'écran quand on y entre
      p.addEventListener("focusin", function () {
        if (p.querySelector(":focus-visible") && PF.goToStep) PF.goToStep(i + 1);
      });
    });
    // Après un redimensionnement, les scènes pas encore atteintes reprennent leur mise en page entière
    ScrollTrigger.addEventListener("refresh", function () {
      scenes.forEach(function (sc, i) {
        if (!sc || tl.time() >= tl.labels["d" + i]) return;
        gsap.set(sc.querySelectorAll(".scene__item"), sceneState(sc, fullRect));
        gsap.set(sc.querySelector(".scene__glow"), glowState(sc, fullRect));
      });
    });
    // Les images des écrans changent de hauteur en se chargeant : on recalcule
    var refreshTimer;
    stack.querySelectorAll(".scene img").forEach(function (img) {
      if (img.complete) return;
      img.addEventListener("load", function () {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(function () { ScrollTrigger.refresh(); }, 200);
      }, { once: true });
    });

    return { tl: tl, ends: ends };
  }

  // Sans animation : les appareils sont placés directement dans le cadre recadré
  function initStaticScenes() {
    var scenes = document.querySelectorAll(".stack .scene");
    if (!scenes.length) return;
    var mobile = function () { return window.matchMedia("(max-width: 767px)").matches; };
    function lay() {
      scenes.forEach(function (sc) {
        PF.sceneApply(sc, mobile() ? PF.sceneRect(sc, 1, 0.56) : PF.sceneRect(sc, 0.59, 1));
      });
    }
    lay();
    window.addEventListener("resize", lay);
  }

  /* ---------- Navigation par étapes ----------
     Étape 0 : le logo. Étapes 1 à N : chaque projet avec ses détails.
     Un seul geste (molette, glissement du doigt, flèche du clavier) passe
     à l'étape suivante ; le défilement et l'animation se jouent tout seuls.
     Après le dernier projet, le scroll redevient normal pour la suite de la page. */
  function initSteps(flight, stage) {
    var lenis = PF.lenis;
    var intro = document.querySelector(".intro");
    if (!lenis || !stage || !intro) return;
    var st = stage.tl.scrollTrigger;
    var engaged = true, busy = false;
    var lastWheel = 0, gestureUsed = false, touchY = null, settleTimer;
    var easeInOut = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

    // positions de scroll de chaque étape (recalculées à chaque fois : suit les redimensionnements)
    function stops() {
      var total = stage.tl.duration();
      return [0].concat(stage.ends.map(function (t) {
        return Math.round(st.start + (st.end - st.start) * (t / total));
      }));
    }
    function last() { var s = stops(); return s[s.length - 1]; }
    function current() {
      var s = stops(), y = window.scrollY, best = 0;
      s.forEach(function (v, i) { if (Math.abs(v - y) < Math.abs(s[best] - y)) best = i; });
      return best;
    }

    function goTo(index, duration) {
      var s = stops();
      index = Math.max(0, Math.min(s.length - 1, index));
      var y = s[index];
      if (Math.abs(window.scrollY - y) < 2) return;
      // le logo s'envole ou revient au centre dès le début du geste
      if (index === 0) flight.timeScale(1.3).reverse();
      else if (window.scrollY < intro.offsetHeight) flight.timeScale(1).play();
      busy = true;
      engaged = true;
      var distance = Math.abs(y - window.scrollY) / window.innerHeight;
      lenis.scrollTo(y, {
        duration: duration || Math.min(2, 0.9 + distance * 0.55),
        easing: easeInOut,
        lock: true,
        force: true,
        onComplete: function () { busy = false; },
      });
    }

    function step(dir) {
      var i = current();
      // après le dernier projet : on rend la main au scroll normal
      if (dir > 0 && i === stops().length - 1) {
        busy = true;
        engaged = false;
        lenis.scrollTo(last() + window.innerHeight * 0.7, {
          duration: 1.1, easing: easeInOut, lock: true, force: true,
          onComplete: function () { busy = false; },
        });
        return;
      }
      goTo(i + dir);
    }

    PF.goToStep = goTo;
    // liens « Projets » et « haut de page » : on passe par les étapes
    PF.anchorHandler = function (hash) {
      if (hash === "#top") { goTo(0); return true; }
      if (hash === "#projets") { goTo(1); return true; }
      return false;
    };

    // Molette / pavé tactile : un geste = une étape (l'inertie qui suit est ignorée)
    window.addEventListener("wheel", function (e) {
      if (!engaged) return;
      e.preventDefault();
      e.stopPropagation();
      var now = performance.now(), gap = now - lastWheel;
      lastWheel = now;
      if (gap > 200) gestureUsed = false;
      if (busy || PF.autoScrolling || gestureUsed || Math.abs(e.deltaY) < 3) return;
      gestureUsed = true;
      step(e.deltaY > 0 ? 1 : -1);
    }, { capture: true, passive: false });

    // Écran tactile : un glissement = une étape
    window.addEventListener("touchstart", function (e) {
      if (engaged) touchY = e.touches[0].clientY;
    }, { capture: true, passive: true });
    window.addEventListener("touchmove", function (e) {
      if (engaged && e.cancelable && e.touches.length === 1) e.preventDefault();
    }, { capture: true, passive: false });
    window.addEventListener("touchend", function (e) {
      if (!engaged || touchY === null) return;
      var dy = touchY - e.changedTouches[0].clientY;
      touchY = null;
      if (busy || PF.autoScrolling || Math.abs(dy) < 40) return;
      step(dy > 0 ? 1 : -1);
    }, { capture: true });

    // Clavier : flèches, Page suivante/précédente, Espace
    window.addEventListener("keydown", function (e) {
      if (!engaged || e.altKey || e.ctrlKey || e.metaKey) return;
      var t = e.target;
      if (t.closest && t.closest("input, textarea, select, [contenteditable]")) return;
      var space = e.key === " " && !(t.closest && t.closest("a, button"));
      var down = e.key === "ArrowDown" || e.key === "PageDown" || (space && !e.shiftKey);
      var up = e.key === "ArrowUp" || e.key === "PageUp" || (space && e.shiftKey);
      if (!down && !up) return;
      e.preventDefault();
      if (!busy && !PF.autoScrolling && !e.repeat) step(down ? 1 : -1);
    }, true);

    // Suivi de la position : retour dans les projets depuis le bas,
    // et recalage sur l'étape la plus proche si on s'est arrêté entre deux
    lenis.on("scroll", function () {
      if (busy || PF.autoScrolling) return;
      var inZone = window.scrollY <= last() + 2;
      if (inZone && !engaged) { goTo(stops().length - 1, 0.7); return; }
      engaged = inZone;
      clearTimeout(settleTimer);
      if (engaged) settleTimer = setTimeout(function () {
        if (busy || PF.autoScrolling) return;
        var i = current();
        if (Math.abs(window.scrollY - stops()[i]) > 3) goTo(i, 0.6);
      }, 250);
    });

    // Au chargement (ou après un redimensionnement) au milieu d'une étape : on se recale
    var settle = function () {
      if (busy || window.scrollY > last() + 2) return;
      var i = current();
      if (Math.abs(window.scrollY - stops()[i]) > 3) lenis.scrollTo(stops()[i], { immediate: true, force: true });
    };
    ScrollTrigger.addEventListener("refresh", settle);
    setTimeout(settle, 300);
  }

  /* ---------- 3. Citations écrites au fil du scroll ----------
     Opacité seulement : gardé même quand les animations sont réduites. */
  function initQuote() {
    var el = document.querySelector("[data-chars]");
    if (!el || !PF.hasGsap) return;
    var text = el.textContent.trim();
    // découpe en mots (insécables) puis en lettres ; texte complet gardé pour les lecteurs d'écran
    var html = text.split(/( +)/).map(function (part) {
      if (/^ +$/.test(part)) return " ";
      return '<span class="qw">' + Array.from(part).map(function (c) {
        return '<span class="qc">' + esc(c) + "</span>";
      }).join("") + "</span>";
    }).join("");
    el.innerHTML = '<span class="sr-only">' + esc(text) + '</span><span aria-hidden="true">' + html + "</span>";
    gsap.fromTo(el.querySelectorAll(".qc"), { opacity: 0.12 }, {
      opacity: 1, ease: "none", stagger: 0.05,
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 40%", scrub: true },
    });
  }

  function initStatement() {
    var el = document.querySelector("[data-words]");
    if (!el || !PF.hasGsap) return;
    el.innerHTML = el.textContent
      .trim()
      .split(/ +/) // espaces normales seulement : les insécables gardent les mots liés
      .map(function (w) { return '<span class="sw">' + esc(w) + "</span>"; })
      .join(" ");
    gsap.fromTo(el.querySelectorAll(".sw"), { opacity: 0.18 }, {
      opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
    });
  }

  renderProjects();
  PF.start();
  var flight = initIntro();
  var stage = initStack();
  if (!stage) initStaticScenes();
  if (flight && stage) initSteps(flight, stage);
  initQuote();
  initStatement();
})();
