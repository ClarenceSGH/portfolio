/* ==========================================================
   Page d'accueil
   1. Arrivée : la signature s'écrit au stylo, s'allume comme un néon,
      puis rejoint la barre du haut pendant que le rideau se lève.
   2. Haut de page : le titre, et un mur incliné des écrans des projets.
   3. Projets empilés : chaque projet arrive en plein cadre (incliné en 3D),
      puis le scroll recadre l'image et fait apparaître ses détails.
   4. Citation et texte écrits au fil du scroll.
   ========================================================== */
(function () {
  var PF = window.PF;
  var esc = PF.esc;
  var root = document.documentElement;
  var projects = window.PROJECTS || [];

  /* ---------- Mur d'écrans (miniatures dans assets/mur/) ----------
     p : écrans de téléphone, l : écrans larges. dur : durée d'un tour (s). */
  var WALL = [
    { type: "p", dur: 80, tiles: ["scan", "wf-profil", "collection", "dj-mobile", "belle-prise"] },
    { type: "l", dur: 110, tiles: ["borne-v3", "dj-recherche", "fishdex-desktop", "borne-semaine", "dj-profil", "borne-v1", "dj-desktop", "borne-v2"] },
    { type: "p", dur: 72, tiles: ["belle-prise", "wf-recherche", "story", "fishdex-mobile", "scan"] },
    { type: "l", dur: 96, tiles: ["dj-profil", "borne-v1", "dj-desktop", "borne-v2", "borne-v3", "dj-recherche", "fishdex-desktop", "borne-semaine"] },
    { type: "p", dur: 88, tiles: ["wf-messages", "story", "collection", "dj-mobile", "wf-profil"] },
  ];

  function renderWall() {
    var wall = document.querySelector("[data-wall]");
    if (!wall) return;
    var cols = WALL.map(function (c) {
      var size = c.type === "p" ? 'width="360" height="780"' : 'width="720" height="450"';
      // la liste est mise deux fois : la boucle tourne sans couture
      var tiles = c.tiles.concat(c.tiles).map(function (t) {
        return '<div class="wall__tile"><img src="assets/mur/' + t + '.jpg" alt="" ' + size + ' decoding="async"></div>';
      }).join("");
      return '<div class="wall__col wall__col--' + c.type + '" style="--dur:' + c.dur + 's"><div class="wall__track">' + tiles + "</div></div>";
    }).join("");
    wall.innerHTML =
      '<div class="wall__scroll"><div class="wall__tilt"><div class="wall__move">' +
        '<div class="wall__plane">' + cols + "</div>" +
      "</div></div></div>";
  }

  /* ---------- Projets ---------- */
  function renderProjects() {
    var stack = document.querySelector("[data-stack]");

    if (!projects.length) {
      stack.innerHTML =
        '<p class="panel__summary" style="padding:20vh var(--gutter)">Aucun projet pour le moment. Ajoute-les dans js/projects.js.</p>';
      return;
    }

    var total = String(projects.length).padStart(2, "0");
    stack.innerHTML = projects
      .map(function (p, i) {
        var url = "projet.html?p=" + encodeURIComponent(p.slug);
        return (
          '<article class="panel" style="--i:' + i + '">' +
            '<div class="panel__inner">' +
              '<div class="panel__stage">' +
                '<a class="panel__media media" href="' + url + '" tabindex="-1" aria-hidden="true" data-project-link data-cursor="Voir le projet">' +
                  (p.scene
                    // couverture en appareils (iPhone, MacBook…) qui se réorganisent au recadrage
                    ? '<div class="panel__media-inner panel__media-inner--scene">' + PF.scene(p, "panel__visual") + "</div>"
                    : '<div class="panel__media-inner"><img class="panel__visual" src="' + esc(p.cover) + '" alt="" ' +
                      (i === 0 ? "" : 'loading="lazy" ') + 'decoding="async"></div>') +
                "</a>" +
                '<div class="panel__details">' +
                  '<p class="panel__meta mono"><b>●</b>' + esc(p.type) + "<span>" + esc(p.year) + "</span></p>" +
                  '<p class="panel__summary">' + esc(p.summary) + "</p>" +
                  '<dl class="panel__facts">' +
                    "<div><dt>Rôle</dt><dd>" + esc(p.role) + "</dd></div>" +
                    "<div><dt>Cadre</dt><dd>" + esc(p.cadre) + "</dd></div>" +
                    "<div><dt>Outils</dt><dd>" + esc((p.tools || []).join(", ")) + "</dd></div>" +
                  "</dl>" +
                  '<a class="btn btn--primary" href="' + url + '" data-project-link data-magnetic>Voir l\'étude de cas <i class="ph ph-arrow-right"></i></a>' +
                "</div>" +
              "</div>" +
              '<div class="panel__head">' +
                '<h3 class="panel__title heading">' + PF.words(p.title) + "</h3>" +
                '<p class="panel__index mono" aria-hidden="true"><b>' + String(i + 1).padStart(2, "0") + "</b> / " + total + "</p>" +
              "</div>" +
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

    // les appareils s'inclinent sous la souris
    stack.querySelectorAll(".panel__stage").forEach(function (st) { PF.tiltDevices(st); });
  }

  /* ---------- 2. Haut de page : apparition du titre et du mur ---------- */
  function heroIn() {
    var tl = gsap.timeline({ paused: true, defaults: { ease: "expo.out" } });
    tl.fromTo(".hero .line > span", { yPercent: 110, y: 0 }, { yPercent: 0, duration: 1.4, stagger: 0.09 }, 0)
      .fromTo(".hero__mark path", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, 0.85)
      .fromTo("[data-hero-item]", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.5)
      .fromTo(".wall", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.4, ease: "power2.out" }, 0)
      .fromTo(".wall__move", { z: -500, rotationX: -14, yPercent: 8 }, { z: 0, rotationX: 0, yPercent: 0, duration: 2.4 }, 0)
      .fromTo(".nav__list", { autoAlpha: 0, y: -10 }, { autoAlpha: 1, y: 0, duration: 1, ease: "power3.out" }, 0.55);
    return tl;
  }

  function initHero() {
    var hero = document.querySelector(".hero");
    if (!hero || !PF.animate) return;
    gsap.set([".wall__scroll", ".wall__tilt", ".wall__move"], { transformStyle: "preserve-3d" });

    // en quittant le haut de page : le texte remonte, le mur recule et s'incline
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
    })
      .to(".hero__content", { y: function () { return -window.innerHeight * 0.18; }, opacity: 0 }, 0)
      .to(".wall__scroll", { rotationX: 16, z: -320, yPercent: -10, opacity: 0.25 }, 0);

    // le mur suit doucement la souris
    if (PF.fine) {
      var tilt = document.querySelector(".wall__tilt");
      var rx = gsap.quickTo(tilt, "rotationX", { duration: 1.2, ease: "power3.out" });
      var ry = gsap.quickTo(tilt, "rotationY", { duration: 1.2, ease: "power3.out" });
      hero.addEventListener("pointermove", function (e) {
        rx(-(e.clientY / window.innerHeight - 0.5) * 6);
        ry((e.clientX / window.innerWidth - 0.5) * 8);
      });
      hero.addEventListener("pointerleave", function () { rx(0); ry(0); });
    }

    // le mur s'arrête quand il n'est plus visible (économie de batterie)
    ScrollTrigger.create({
      trigger: hero,
      start: "top top",
      end: "bottom top",
      onLeave: function () { hero.classList.add("is-off"); },
      onEnterBack: function () { hero.classList.remove("is-off"); },
    });

    PF.navSolidAt = function () { return hero.offsetHeight * 0.85; };
  }

  /* ---------- 1. Arrivée : la signature s'écrit ---------- */
  function initLoader(hero) {
    var loader = document.querySelector("[data-loader]");
    var play = root.classList.contains("is-loading") && PF.animate && !!window.SIGNATURE && loader;

    if (!play) {
      if (loader) loader.remove();
      root.classList.remove("is-loading");
      if (hero) hero.play();
      return;
    }

    // départ en haut de page, scroll bloqué pendant l'écriture
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    PF.locked = true;
    if (PF.lenis) PF.lenis.stop();

    var bg = loader.querySelector("[data-loader-bg]");
    var box = loader.querySelector("[data-loader-sig]");
    var note = loader.querySelector("[data-loader-note]");
    box.innerHTML = PF.signature({ draw: true }) + '<div class="loader__glow">' + PF.signature() + "</div>";
    var svg = box.querySelector("svg");
    var glow = box.querySelector(".loader__glow");
    var dockTo = document.querySelector(".nav__brand .sig") || document.querySelector(".nav__brand");

    // point d'arrivée : la signature de la barre du haut
    var from = null, to = null;
    function measure() {
      from = box.getBoundingClientRect();
      to = dockTo.getBoundingClientRect();
    }

    var tl = gsap.timeline({ delay: 0.3 });
    tl.fromTo(note, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: "power2.out" }, 0)
      .add(PF.writeSignature(svg, { speed: 1100, unmask: true }), 0.15)
      // le néon s'allume : petits scintillements, puis le halo reste
      .to(glow, {
        keyframes: [
          { opacity: 0.85, duration: 0.05 }, { opacity: 0.1, duration: 0.06 },
          { opacity: 0.7, duration: 0.05 }, { opacity: 0.25, duration: 0.09 },
          { opacity: 0.95, duration: 0.3 },
        ],
        ease: "none",
      }, ">-0.02")
      .to(svg, { keyframes: [{ opacity: 0.55, duration: 0.06 }, { opacity: 1, duration: 0.05 }, { opacity: 0.7, duration: 0.07 }, { opacity: 1, duration: 0.1 }], ease: "none" }, "<")
      .addLabel("exit", ">+0.35")
      .call(measure, null, "exit")
      // le rideau se lève, la signature rejoint sa place dans la barre
      .to(bg, { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, "exit")
      .to(note, { autoAlpha: 0, y: -10, duration: 0.45, ease: "power2.in" }, "exit")
      .to(box, {
        x: function () { return to.left - from.left; },
        y: function () { return to.top - from.top; },
        scale: function () { return to.width / from.width; },
        duration: 1.2,
        ease: "expo.inOut",
      }, "exit")
      .to(glow, { opacity: 0, duration: 0.9, ease: "power2.out" }, "exit+=0.2")
      .call(function () { if (hero) hero.play(); }, null, "exit+=0.5")
      .call(finish, null, "exit+=1.2");

    function finish() {
      root.classList.remove("is-loading");
      loader.remove();
      PF.locked = false;
      if (PF.lenis) PF.lenis.start();
      ScrollTrigger.refresh();
    }

    // un geste pendant l'arrivée : on accélère jusqu'à la fin
    function hurry() { if (tl.progress() < 1) tl.timeScale(3.5); }
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (type) {
      window.addEventListener(type, hurry, { once: true, passive: true });
    });
  }

  /* ---------- 3. Pile de projets avec détails ---------- */
  function initStack() {
    var stack = document.querySelector("[data-stack]");
    var panels = gsap.utils.toArray(".panel");
    if (!PF.animate || !panels.length) return null;
    root.classList.add("has-stack");

    var mobile = function () { return window.matchMedia("(max-width: 767px)").matches; };
    var radius = function () { return mobile() ? 16 : 24; };
    var FULL = function () { return "inset(0% 0% 0% 0% round " + radius() + "px)"; };
    var cropped = function () {
      return mobile() ? "inset(0% 0% 44% 0% round 16px)" : "inset(0% 41% 0% 0% round 24px)";
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
      gsap.set(p.querySelector(".panel__media"), { clipPath: FULL() });
      gsap.set(p.querySelector(".panel__media-inner"), { x: 0, y: 0, xPercent: 0, yPercent: 0 });
      gsap.set(details(p), { autoAlpha: 0, y: 24 });
      gsap.set(p.querySelector(".panel__stage"), { transformPerspective: 1600, transformOrigin: "50% 100%" });
      if (i > 0) {
        gsap.set(p, { yPercent: 100 });
        // le projet suivant arrive incliné, comme un écran que l'on redresse
        gsap.set(p.querySelector(".panel__stage"), { rotationX: 22 });
        gsap.set(p.querySelector(".panel__visual"), { scale: 1.15 });
        gsap.set(p.querySelectorAll(".panel__title .w > span"), { yPercent: 110 });
        gsap.set(p.querySelector(".panel__index"), { autoAlpha: 0 });
      }
    });

    // Le premier projet se redresse et grandit en arrivant
    var first = panels[0];
    gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: stack, start: "top bottom", end: "top top", scrub: true },
    })
      .fromTo(first.querySelector(".panel__inner"), { scale: 0.88 }, { scale: 1 }, 0)
      .fromTo(first.querySelector(".panel__stage"), { rotationX: 24 }, { rotationX: 0 }, 0);
    gsap.fromTo(first.querySelectorAll(".panel__title .w > span"), { yPercent: 110 }, {
      yPercent: 0, duration: 1.2, ease: "expo.out", stagger: 0.06,
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
          .to(p.querySelector(".panel__stage"), { rotationX: 0, duration: 1, ease: "power2.out" }, "p" + i)
          .fromTo(prev.querySelector(".panel__inner"), { scale: 1 }, { scale: 0.93, duration: 1, immediateRender: false }, "p" + i)
          .to(prev.querySelector(".panel__veil"), { opacity: 0.82, duration: 1 }, "p" + i)
          // le titre précédent s'efface tout de suite : un seul titre lisible à la fois
          .to([prev.querySelector(".panel__title"), prev.querySelector(".panel__index")], { autoAlpha: 0, duration: 0.3 }, "p" + i)
          .to(p.querySelector(".panel__visual"), { scale: 1, duration: 1 }, "p" + i)
          .to(p.querySelectorAll(".panel__title .w > span"),
            { yPercent: 0, duration: 0.45, stagger: 0.05, ease: "power3.out" }, "p" + i + "+=0.5")
          .to(p.querySelector(".panel__index"), { autoAlpha: 1, duration: 0.3 }, "p" + i + "+=0.6");
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
     Étape 0 : le haut de page. Étapes 1 à N : chaque projet avec ses détails.
     Un seul geste (molette, glissement du doigt, flèche du clavier) passe
     à l'étape suivante ; le défilement et l'animation se jouent tout seuls.
     Après le dernier projet, le scroll redevient normal pour la suite de la page. */
  function initSteps(stage) {
    var lenis = PF.lenis;
    if (!lenis || !stage) return;
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
      if (PF.locked) return;
      var s = stops();
      index = Math.max(0, Math.min(s.length - 1, index));
      var y = s[index];
      if (Math.abs(window.scrollY - y) < 2) return;
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
      if (PF.locked) return;
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
      if (PF.locked || busy || PF.autoScrolling || Math.abs(dy) < 40) return;
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
      if (!PF.locked && !busy && !PF.autoScrolling && !e.repeat) step(down ? 1 : -1);
    }, true);

    // Suivi de la position : retour dans les projets depuis le bas,
    // et recalage sur l'étape la plus proche si on s'est arrêté entre deux
    lenis.on("scroll", function () {
      if (busy || PF.autoScrolling || PF.locked) return;
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
      if (busy || PF.locked || window.scrollY > last() + 2) return;
      var i = current();
      if (Math.abs(window.scrollY - stops()[i]) > 3) lenis.scrollTo(stops()[i], { immediate: true, force: true });
    };
    ScrollTrigger.addEventListener("refresh", settle);
    setTimeout(settle, 300);
  }

  /* ---------- 4. Citation et texte écrits au fil du scroll ---------- */
  function initQuote() {
    var el = document.querySelector("[data-chars]");
    if (!el || !PF.hasGsap) return;
    var text = el.textContent.trim();
    // découpe en mots (insécables) puis en lettres ; texte complet gardé pour les lecteurs d'écran
    var html = text.split(/( +)/).map(function (part) {
      if (/^ +$/.test(part)) return " ";
      // le mot-clé de la phrase en vert
      var hl = /^question/.test(part) ? " hl" : "";
      return '<span class="qw' + hl + '">' + Array.from(part).map(function (c) {
        return '<span class="qc">' + esc(c) + "</span>";
      }).join("") + "</span>";
    }).join("");
    el.innerHTML = '<span class="sr-only">' + esc(text) + '</span><span aria-hidden="true">' + html + "</span>";
    gsap.fromTo(el.querySelectorAll(".qc"), { opacity: 0.1 }, {
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
    gsap.fromTo(el.querySelectorAll(".sw"), { opacity: 0.16 }, {
      opacity: 1, ease: "none", stagger: 0.1,
      scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true },
    });
  }

  renderWall();
  renderProjects();
  PF.start();
  var hero = PF.animate ? heroIn() : null;
  initHero();
  var stage = initStack();
  if (!stage) initStaticScenes();
  if (stage) initSteps(stage);
  initQuote();
  initStatement();
  initLoader(hero);
})();
