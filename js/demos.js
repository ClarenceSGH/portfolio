/* ==========================================================
   Présentations animées des projets (accueil et pages projet)
   Chaque section <section data-demo="fishdex|borne-edna|dj-platform">
   est remplie et animée au fil du scroll :
   - FISHDEX : les composants de l'écran sont éparpillés à côté du
     téléphone ; une souris les remet à leur place, comme dans Figma,
     et le dernier se fait attraper par une canne à pêche.
   - Borne EDNA : les cartes de l'accueil gravitent en 3D autour de la
     borne, puis se rangent dans l'écran.
   - DJ Platform : une table de mixage ; le crossfader fait passer
     l'écran du wireframe à la maquette.
   Données : "demo" de chaque projet dans js/projects.js.
   ========================================================== */
(function () {
  var PF = window.PF;
  var esc = PF.esc;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeInOut = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

  // section épinglée, animation pilotée par le scroll
  function pinned(section, screens) {
    return {
      trigger: section,
      start: "top top",
      end: function () { return "+=" + Math.round(window.innerHeight * screens); },
      pin: true,
      scrub: 1,
      invalidateOnRefresh: true,
    };
  }

  // boîte englobante des images d'un composant (unités de la maquette)
  function bbox(items) {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    items.forEach(function (it) {
      x0 = Math.min(x0, it.x); y0 = Math.min(y0, it.y);
      x1 = Math.max(x1, it.x + it.w); y1 = Math.max(y1, it.y + it.h);
    });
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }

  // HTML d'un composant : ses images, placées dans sa boîte (en cqw de l'écran)
  function partHTML(p, base, k, cls) {
    var u = function (v) { return (v * k).toFixed(3) + "cqw"; };
    var b = p.box;
    var frame = typeof p.frame === "string" ? ";--frame:" + esc(p.frame) : "";
    return '<div class="' + cls + '" style="left:' + u(b.x) + ";top:" + u(b.y) + ";width:" + u(b.w) + ";height:" + u(b.h) + frame + '">' +
      p.items.map(function (it) {
        return '<img src="' + esc(base + it.src) + '" alt="" style="left:' + u(it.x - b.x) + ";top:" + u(it.y - b.y) + ";width:" + u(it.w) + '" decoding="async">' +
          (it.emoji || []).map(function (e) {
            return '<span class="demo__emoji" style="left:' + u(it.x - b.x + e[1]) + ";top:" + u(it.y - b.y + e[2]) + '">' + e[0] + "</span>";
          }).join("");
      }).join("") +
      (cls.indexOf("fx__part") > -1 ? '<span class="fx__sel" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' : "") +
      "</div>";
  }

  // la canne à pêche, dans son repère : talon en (0, 0), scion en (-L, 0)
  function rodHTML(L) {
    var g = (0.24 * L).toFixed(1), m = (-0.3 * L).toFixed(1);
    return '<path class="fx__stick" d="M0 -4.4 L' + -L + " -1.1 L" + -L + ' 1.1 L0 4.4 Z"/>' +
      '<rect class="fx__grip" x="' + -g + '" y="-6" width="' + g + '" height="12" rx="6"/>' +
      '<circle class="fx__reel" cx="' + m + '" r="15"/>' +
      '<g class="fx__crank"><path d="M0 0 V-13"/><circle cy="-13" r="3.6"/></g>' +
      '<circle class="fx__reel-hub" cx="' + m + '" r="4.5"/>' +
      '<circle class="fx__ring" cx="' + -L + '" r="2.6"/>';
  }

  /* ---------- FISHDEX : remettre chaque composant à sa place ---------- */
  function fishdex(section, data) {
    var stage = section.querySelector("[data-demo-stage]");
    var S = data.screen, k = 100 / S.w;
    var parts = data.parts.map(function (p) { return Object.assign({ box: bbox(p.items) }, p); });

    stage.innerHTML =
      '<div class="fx"><div class="fx__phone"><div class="fx__screen" style="background:' + esc(S.bg) + ";--fx-bg:" + esc(S.bg) + '">' +
        parts.map(function (p) { return partHTML(p, data.base, k, "fx__part" + (p.rod ? " fx__part--rod" : "") + (p.frame ? " fx__part--frame" : "")); }).join("") +
        // la canne à pêche (repère : celui de l'écran, 375 × 817)
        '<svg class="fx__rod" viewBox="0 0 ' + S.w + " " + S.h + '" aria-hidden="true">' +
          '<path class="fx__line" fill="none"/>' +
          '<g class="fx__pole">' + rodHTML(data.rod.len) + "</g>" +
          '<g class="fx__hook"><path d="M0 -14 V6 a8 8 0 1 1 -12 -7" fill="none"/></g>' +
        "</svg>" +
        '<span class="fx__click" aria-hidden="true"></span>' +
        '<div class="fx__cursor" aria-hidden="true"><i class="ph-fill ph-cursor"></i><span>Clarence</span></div>' +
      "</div></div></div>";

    var screen = stage.querySelector(".fx__screen");
    var els = stage.querySelectorAll(".fx__part");
    parts.forEach(function (p, i) { p.el = els[i]; p.sel = els[i].querySelector(".fx__sel"); });
    var cursor = stage.querySelector(".fx__cursor");
    var icon = cursor.querySelector("i");
    var click = stage.querySelector(".fx__click");
    var U = function () { return screen.offsetWidth / S.w; };

    // taille : le téléphone et les composants éparpillés tiennent dans la scène
    function layout() {
      var w = stage.clientWidth, h = stage.clientHeight;
      var phone = Math.min(h * 0.84 * S.w / S.h, w * 0.94 * S.w / data.world);
      stage.style.setProperty("--fx-w", Math.round(phone) + "px");
    }
    layout();
    window.addEventListener("resize", layout);

    var fish = parts.filter(function (p) { return p.rod; })[0];
    var drag = parts.filter(function (p) { return !p.rod; }).sort(function (a, b) { return a.step - b.step; });

    // état de départ : chaque composant éparpillé autour du téléphone
    drag.forEach(function (p) {
      gsap.set(p.el, {
        x: function () { return (p.at[0] - p.box.cx) * U(); },
        y: function () { return (p.at[1] - p.box.cy) * U(); },
        rotation: p.at[2] || 0,
        scale: p.at[3] || 1,
        "--sh": 1,
      });
    });
    gsap.set(cursor, { x: function () { return data.cursor[0] * U(); }, y: function () { return data.cursor[1] * U(); } });
    if (!PF.animate) return;

    var tl = gsap.timeline({ defaults: { ease: "power2.inOut" }, scrollTrigger: pinned(section, 3.4) });
    var t = 0.15;
    drag.forEach(function (p) {
      var ax = function () { return p.at[0] * U(); }, ay = function () { return p.at[1] * U(); };
      // la souris va chercher le composant…
      tl.to(cursor, { x: ax, y: ay, duration: 0.28 }, t);
      t += 0.28;
      // …clique (anneau), le sélectionne…
      tl.to(icon, { scale: 0.8, duration: 0.05, ease: "power1.out" }, t)
        .fromTo(click, { x: ax, y: ay, scale: 0.3, opacity: 0.9 }, { x: ax, y: ay, scale: 1.6, opacity: 0, duration: 0.25, ease: "power1.out", immediateRender: false }, t)
        .to(p.sel, { opacity: 1, duration: 0.05 }, t)
        .to(p.el, { scale: (p.at[3] || 1) * 1.04, duration: 0.06 }, t);
      t += 0.06;
      // …le glisse à sa place dans l'écran…
      var cx = function () { return p.box.cx * U(); }, cy = function () { return p.box.cy * U(); };
      tl.to(cursor, { x: cx, y: cy, duration: 0.38 }, t)
        .to(p.el, { x: 0, y: 0, rotation: 0, scale: 1.04, duration: 0.38 }, t);
      t += 0.38;
      // …et le lâche
      tl.to(icon, { scale: 1, duration: 0.05 }, t)
        .to(p.el, { scale: 1, "--sh": 0, duration: 0.08 }, t)
        .to(p.sel, { opacity: 0, duration: 0.08 }, t + 0.04);
      t += 0.12;
    });

    // ---------- le dernier composant se pêche ----------
    // La souris saisit la canne par la poignée. Repère de la canne : le talon en (0, 0),
    // le scion en (-L, 0) ; une pose = [talon x, talon y, angle] dans l'écran.
    var R = data.rod, L = R.len;
    var pole = stage.querySelector(".fx__pole"), line = stage.querySelector(".fx__line"), hook = stage.querySelector(".fx__hook");
    var crank = stage.querySelector(".fx__crank");
    var F = fish.box;
    // drop : 0 = hameçon au bout de la canne, 1 = accroché au poisson ; spin : tours du moulinet
    var st = {
      px: R.fish[0], py: 0, a: R.fish[2], drop: 0, spin: 0, hold: 0,
      fx: fish.at[0] - F.cx, fy: fish.at[1] - F.cy, fr: fish.at[2] || 0, fs: fish.at[3] || 1, sh: 1,
    };
    // talon assez bas pour que toute la canne soit sous le bord du canevas
    var hidden = function () { return S.h / 2 + stage.clientHeight / 2 / U() + L + 40; };
    st.py = hidden();
    function tipOf(s) {
      var r = s.a * Math.PI / 180;
      return [s.px - L * Math.cos(r), s.py - L * Math.sin(r)];
    }
    function render() {
      var u = U();
      fish.el.style.transform = "translate(" + (st.fx * u).toFixed(2) + "px," + (st.fy * u).toFixed(2) + "px) rotate(" + st.fr.toFixed(2) + "deg) scale(" + st.fs.toFixed(3) + ")";
      fish.el.style.setProperty("--sh", st.sh.toFixed(2));
      pole.setAttribute("transform", "translate(" + st.px.toFixed(1) + " " + st.py.toFixed(1) + ") rotate(" + st.a.toFixed(2) + ")");
      crank.setAttribute("transform", "translate(" + (-0.3 * L) + " 0) rotate(" + (st.spin * 360).toFixed(1) + ")");
      var tip = tipOf(st);
      // point d'accroche sur le dos du poisson (suit sa rotation)
      var r = st.fr * Math.PI / 180, ox = R.bite[0] * st.fs, oy = R.bite[1] * st.fs;
      var bite = [F.cx + st.fx + ox * Math.cos(r) - oy * Math.sin(r), F.cy + st.fy + ox * Math.sin(r) + oy * Math.cos(r)];
      var hx = lerp(tip[0], bite[0], st.drop), hy = lerp(tip[1] + 14, bite[1], st.drop);
      hook.setAttribute("transform", "translate(" + hx.toFixed(1) + " " + hy.toFixed(1) + ")");
      // le fil, légèrement détendu
      var mx = (tip[0] + hx) / 2, my = (tip[1] + hy) / 2 + 16 * st.drop;
      line.setAttribute("d", "M" + tip[0].toFixed(1) + " " + tip[1].toFixed(1) + " Q" + mx.toFixed(1) + " " + my.toFixed(1) + " " + hx.toFixed(1) + " " + (hy - 14).toFixed(1));
      // tant qu'elle tient la canne, la souris suit la poignée
      if (st.hold > 0.5) gsap.set(cursor, { x: st.px * u, y: st.py * u });
    }
    render();
    window.addEventListener("resize", render);
    var go = function (vars, d, at, ease) { tl.to(st, Object.assign({ duration: d, ease: ease || "power2.inOut", onUpdate: render }, vars), at); };
    var pose = function (p) { return { px: p[0], py: p[1], a: p[2] }; };
    var hx = function () { return R.fish[0] * U(); }, hy = function () { return R.fish[1] * U(); };
    // la canne monte du bas du canevas, la souris va la saisir par la poignée
    tl.fromTo(st, { py: hidden }, { py: R.fish[1], duration: 0.5, ease: "power3.out", onUpdate: render }, t);
    tl.to(cursor, { x: hx, y: hy, duration: 0.5 }, t);
    t += 0.5;
    tl.to(icon, { scale: 0.8, duration: 0.05, ease: "power1.out" }, t)
      .fromTo(click, { x: hx, y: hy, scale: 0.3, opacity: 0.9 }, { x: hx, y: hy, scale: 1.6, opacity: 0, duration: 0.25, ease: "power1.out", immediateRender: false }, t);
    go({ hold: 1 }, 0.01, t, "none");
    t += 0.06;
    go({ drop: 1 }, 0.45, t); t += 0.45;                                        // l'hameçon descend
    go({ keyframes: [{ fr: (fish.at[2] || 0) - 9 }, { fr: (fish.at[2] || 0) + 7 }, { fr: -8 }] }, 0.3, t, "none"); t += 0.3; // ça mord
    go(Object.assign(pose(R.lift), { fy: st.fy - 230, spin: 1.5 }), 0.42, t); t += 0.42; // on ferre et on remonte
    go(Object.assign(pose(R.over), { fx: 0, fy: -150, fr: 5, fs: 1 }), 0.55, t); t += 0.55; // au-dessus de sa place
    go({ fy: 0, fr: 0, sh: 0, spin: 0.9 }, 0.35, t, "power2.out"); t += 0.35;  // posé dans la carte
    go({ drop: 0, spin: 1.6 }, 0.3, t); t += 0.3;                               // l'hameçon se décroche
    // la souris lâche la canne, qui redescend hors du canevas
    tl.to(icon, { scale: 1, duration: 0.05 }, t);
    go({ hold: 0 }, 0.01, t, "none");
    go({ py: hidden, a: R.over[2] + 20 }, 0.45, t + 0.04, "power3.inOut");
    tl.to(cursor, { x: function () { return data.cursor[0] * U(); }, y: function () { return data.cursor[1] * U(); }, duration: 0.45 }, t + 0.1);
    t += 0.55;
    tl.to({}, { duration: 0.3 }, t);
  }

  /* ---------- Borne EDNA : un accueil en orbite ---------- */
  function borne(section, data) {
    var stage = section.querySelector("[data-demo-stage]");
    var S = data.screen, k = 100 / S.w;
    var cq = function (v) { return (v * k).toFixed(3) + "cqw"; };
    var parts = data.parts.map(function (p) { return Object.assign({ box: bbox(p.items) }, p); });
    stage.innerHTML =
      '<div class="kiosk"><div class="kiosk__head"><div class="kiosk__screen" style="background:' + esc(S.bg) + '">' +
        // les emplacements vides, comme une grille de mise en page
        parts.map(function (p) {
          var b = p.box;
          return '<span class="kiosk__slot" style="left:' + cq(b.x) + ";top:" + cq(b.y) + ";width:" + cq(b.w) + ";height:" + cq(b.h) + '"></span>';
        }).join("") +
        '<span class="kiosk__ring" aria-hidden="true"></span>' +
        parts.map(function (p) { return partHTML(p, data.base, k, "kiosk__part" + (p.frame ? " kiosk__part--frame" : "")); }).join("") +
      '</div><span class="kiosk__nfc" aria-hidden="true"></span></div>' +
      '<div class="kiosk__body"><img src="' + esc(data.logo) + '" alt="" decoding="async"></div>' +
      '<div class="kiosk__foot"></div></div>';

    var kiosk = stage.querySelector(".kiosk");
    var screen = stage.querySelector(".kiosk__screen");
    var ring = stage.querySelector(".kiosk__ring");
    var els = screen.querySelectorAll(".kiosk__part");
    parts.forEach(function (p, i) { p.el = els[i]; });
    function layout() {
      var w = stage.clientWidth, h = stage.clientHeight;
      stage.style.setProperty("--k-w", Math.round(Math.min(w / 2.5, h / 1.75, 520)) + "px");
    }
    layout();
    window.addEventListener("resize", layout);

    var B = { v: 0 }; // 0 : en orbite ; 1 : rangées dans l'écran
    var time = 0, running = false;
    // seules les cartes avec "orbit" gravitent ; les autres sont déjà à leur place
    var orbiting = parts.filter(function (p) { return p.orbit; }), n = orbiting.length;
    orbiting.forEach(function (p, i) { p.th = (i / n) * Math.PI * 2; });
    // l'anneau est un cercle couché autour de l'écran, vu un peu d'en haut (inclinaison A)
    var A = 17 * Math.PI / 180, SA = Math.sin(A), CA = Math.cos(A), TAU = Math.PI * 2;
    function frame(dt) {
      time += dt;
      var sw = screen.offsetWidth, shh = screen.offsetHeight, u = sw / S.w, W = kiosk.offsetWidth;
      var R = W * 0.92;
      ring.style.width = ring.style.height = (2 * R).toFixed(1) + "px";
      ring.style.transform = "translate(-50%, -50%) rotateX(" + (90 - A * 180 / Math.PI).toFixed(2) + "deg)";
      ring.style.opacity = clamp(1 - B.v * 2.4, 0, 1).toFixed(3);
      orbiting.forEach(function (p, i) {
        // chaque carte quitte l'anneau à son tour : elle revient d'abord devant la borne
        // (swing), puis rejoint son emplacement dans l'écran (e)
        var r = clamp(B.v * 1.5 - i * 0.16, 0, 1);
        var swing = easeInOut(clamp(r * 1.8, 0, 1)), e = easeInOut(clamp((r - 0.3) / 0.7, 0, 1)), q = 1 - e;
        if (r === 0) p.th += dt * 0.42; // en orbite ; l'angle est figé pendant le rangement
        var th = p.th + (Math.round(p.th / TAU) * TAU - p.th) * swing, front = Math.cos(th);
        var bob = Math.sin(time * 1.3 + i * 1.7) * W * 0.012;
        var ox = sw / 2 + R * Math.sin(th), oy = shh / 2 + p.orbit[0] * W + R * front * SA + bob, oz = R * front * CA;
        var dx = ox - p.box.cx * u, dy = oy - p.box.cy * u;
        // le trajet vers l'écran s'arrondit un peu vers nous
        var lift = Math.sin(Math.PI * e) * W * 0.18;
        p.el.style.transform = "translate3d(" + (dx * q).toFixed(1) + "px," + (dy * q).toFixed(1) + "px," + (oz * q + lift).toFixed(1) + "px)" +
          " rotateY(" + (Math.sin(th) * 30 * q).toFixed(2) + "deg) rotate(" + ((p.orbit[2] || 0) * q).toFixed(2) + "deg)" +
          " scale(" + lerp(p.orbit[1], 1, e).toFixed(3) + ")";
        // ombre portée tant qu'elle flotte ; les cartes de derrière passent dans l'ombre
        p.el.style.setProperty("--sh", q.toFixed(3));
        p.el.style.setProperty("--dim", (q * (1 - front) * 0.14).toFixed(3));
      });
    }
    frame(0);
    if (!PF.animate) { B.v = 1; frame(0); return; }
    window.addEventListener("resize", function () { frame(0); });

    var st = gsap.timeline({ scrollTrigger: pinned(section, 2.4) })
      .to(B, { v: 1, duration: 1, ease: "none", onUpdate: function () { frame(0); } }, 0)
      .fromTo(kiosk, { rotationY: -24, rotationX: -7 }, { rotationY: -7, rotationX: -2, duration: 1, ease: "power1.inOut" }, 0)
      .to({}, { duration: 0.15 }).scrollTrigger;
    // l'anneau tourne en continu, plus vite quand on scrolle
    gsap.ticker.add(function (t, dtMs) {
      if (running) frame(dtMs / 1000 * (1 + Math.min(2.5, Math.abs(st.getVelocity()) / 900)));
    });
    ScrollTrigger.create({
      trigger: section, start: "top bottom", end: "bottom top",
      onToggle: function (self) { running = self.isActive; },
    });
  }

  /* ---------- DJ Platform : du wireframe à la maquette, au crossfader ---------- */
  function dj(section, data) {
    var stage = section.querySelector("[data-demo-stage]");
    // une platine : le disque (son étiquette reprend l'écran) et le bras de lecture
    var deck = function (src, name, mod) {
      return '<div class="dj__deck"><div class="dj__platter">' +
          '<div class="dj__vinyl' + mod + '"><span class="dj__label" style="background-image:url(\'' + esc(src) + '\')"></span></div>' +
          '<svg class="dj__arm" viewBox="0 0 100 100"><circle cx="94" cy="8" r="6"/><path d="M94 8 L82 55 L73 65"/><path class="dj__head" d="M74.5 63 L68 70.5"/></svg>' +
        "</div><p>" + name + "</p></div>";
    };
    stage.innerHTML =
      '<div class="dj" aria-hidden="true"><div class="dj__console">' +
        deck(data.wireframe, "Wireframe", "") +
        '<div class="dj__center">' +
          '<div class="dj__phone"><div class="dj__screen">' +
            '<img class="dj__wire" src="' + esc(data.wireframe) + '" alt="" decoding="async">' +
            '<img class="dj__hifi" src="' + esc(data.maquette) + '" alt="" decoding="async">' +
            '<span class="dj__wipe"></span>' +
          '</div><span class="dj__island"></span></div>' +
          '<div class="dj__mixer">' +
            '<div class="dj__meters"><span class="dj__meter"></span><span class="dj__meter"></span></div>' +
            '<div class="dj__fader"><span class="dj__knob"></span></div>' +
            "<p>Crossfader</p>" +
          "</div>" +
        "</div>" +
        deck(data.maquette, "Maquette", " dj__vinyl--b") +
      "</div></div>";

    var phone = stage.querySelector(".dj__phone"), hifi = stage.querySelector(".dj__hifi"), wipe = stage.querySelector(".dj__wipe");
    var knob = stage.querySelector(".dj__knob"), fader = stage.querySelector(".dj__fader");
    var vinyls = stage.querySelectorAll(".dj__vinyl"), meters = stage.querySelectorAll(".dj__meter");
    function layout() {
      var w = stage.clientWidth, h = stage.clientHeight;
      stage.style.setProperty("--dj-w", Math.round(Math.min(w * 0.98, (h - 70) / 0.72, 860)) + "px");
    }
    layout();
    window.addEventListener("resize", layout);

    var P = { p: 0 };
    function render() {
      var p = P.p;
      hifi.style.clipPath = "inset(0 " + ((1 - p) * 100).toFixed(2) + "% 0 0)";
      wipe.style.left = (p * 100).toFixed(2) + "%";
      wipe.style.opacity = p > 0.005 && p < 0.995 ? 1 : 0;
      knob.style.transform = "translateX(" + (p * (fader.clientWidth - knob.offsetWidth)).toFixed(1) + "px)";
      phone.style.transform = "rotateY(" + lerp(-16, 16, p).toFixed(2) + "deg)";
    }
    render();
    window.addEventListener("resize", render);
    if (!PF.animate) { P.p = 1; render(); return; }

    var st = gsap.timeline({ scrollTrigger: pinned(section, 2.2) })
      .to(P, { p: 1, duration: 1, ease: "power1.inOut", onUpdate: render })
      .to({}, { duration: 0.15 }).scrollTrigger;

    // les disques tournent (plus vite quand on scrolle : on « scratche »),
    // les vumètres et la lueur du téléphone suivent le rythme
    var angle = [0, 0], running = false, time = 0;
    gsap.ticker.add(function (t, dtMs) {
      if (!running) return;
      var dt = dtMs / 1000, vel = st.getVelocity(), v = Math.min(3000, Math.abs(vel));
      time += dt;
      angle[0] += dt * (120 + v * 0.35) * (vel < 0 ? -1 : 1);
      angle[1] += dt * (120 + v * 0.35);
      vinyls[0].style.transform = "rotate(" + angle[0].toFixed(1) + "deg)";
      vinyls[1].style.transform = "rotate(" + angle[1].toFixed(1) + "deg)";
      var beat = 0.55 + 0.45 * Math.abs(Math.sin(time * 4.2)) * (0.7 + 0.3 * Math.sin(time * 1.7));
      var boost = Math.min(1, v / 1500);
      meters[0].style.setProperty("--lvl", ((1 - P.p) * clamp(beat + boost * 0.3, 0, 1)).toFixed(3));
      meters[1].style.setProperty("--lvl", (P.p * clamp(beat * 0.9 + boost * 0.3, 0, 1)).toFixed(3));
      phone.style.setProperty("--beat", (0.35 + 0.65 * Math.pow(Math.abs(Math.sin(time * 4.2)), 3)).toFixed(3));
    });
    ScrollTrigger.create({
      trigger: section, start: "top bottom", end: "bottom top",
      onToggle: function (self) { running = self.isActive; },
    });
  }

  var builders = { "fishdex": fishdex, "borne-edna": borne, "dj-platform": dj };

  // remplit et anime toutes les sections [data-demo] de la page
  PF.demos = function (scope) {
    (scope || document).querySelectorAll("[data-demo]").forEach(function (section) {
      var slug = section.getAttribute("data-demo");
      var p = (window.PROJECTS || []).filter(function (x) { return x.slug === slug; })[0];
      if (p && p.demo && builders[slug]) builders[slug](section, p.demo);
    });
  };
})();
