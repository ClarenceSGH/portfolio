/* ==========================================================
   TES PROJETS
   ----------------------------------------------------------
   Ce fichier alimente la page d'accueil ET les pages projet.

   Champs utilisés sur l'accueil : title, type, year, role,
   cadre, tools, summary, et scene (ou cover, une simple image).

   Appareils (device) : "iphone", "mac" (MacBook), "screen" (écran
   tactile, pour la borne) ou "free" (image détourée).

   La page projet est construite à partir de "story" : une
   suite de blocs qui s'affichent dans l'ordre. Types de blocs :
     text      titre + paragraphe (et liste "points" facultative)
     phones    rangée d'iPhone, avec une étiquette
     scroll    MacBook + iPhone dont l'écran défile pendant le scroll
     image     une image, seule ou dans un appareil (device)
     pair      deux images côte à côte
     split     une image et des points d'explication
     versions  plusieurs versions d'un écran, avec des onglets
     palette   couleurs et typographies
     personas  fiches personas
     columns   colonnes de listes (ex. : niveaux d'accès)
     statement grande phrase mise en avant

   Images : dans assets/projets/<slug>/
   ========================================================== */

window.PROJECTS = [
  {
    slug: "fishdex",
    title: "FISHDEX",
    type: "Application mobile",
    year: "2026",
    role: "UX/UI design",
    cadre: "Projet d'école, en équipe de 3",
    tools: ["Figma"],
    cover: "assets/projets/fishdex/cover.jpg",
    // Couverture en appareils. Pour chaque format de cadre (wide : large,
    // narrow : carré, tall : haut), [centre x, centre y, largeur, rotation]
    // sur une grille de 1600×1000, 1000×1000 ou 600×1000.
    scene: {
      bg: "linear-gradient(160deg, #3438b4 0%, #23258a 55%, #181a66 100%)",
      glow: "rgba(110, 118, 255, 0.55)",
      items: [
        { device: "iphone", src: "assets/projets/fishdex/collection.jpg", wide: [330, 530, 400], narrow: [255, 540, 340, -8], tall: [152, 565, 230, -6] },
        { device: "iphone", src: "assets/projets/fishdex/story.jpg", wide: [1270, 530, 400], narrow: [745, 540, 340, 8], tall: [448, 565, 230, 6] },
        { device: "iphone", src: "assets/projets/fishdex/belle-prise.jpg", wide: [800, 480, 400], narrow: [500, 500, 410], tall: [300, 480, 330] },
      ],
    },
    stage: "#272a94",
    accent: "#3236b0",
    fonts: "family=Climate+Crisis&family=Josefin+Sans:wght@400;700",
    summary:
      "Photographier sa prise, découvrir l'espèce, l'ajouter à sa collection : FISHDEX fait de chaque session de pêche une partie de Pokédex.",
    context:
      "Projet d'école mené à trois. L'idée : une application qui identifie un poisson à partir d'une photo, puis l'ajoute à une collection personnelle que l'on complète, prise après prise, et que l'on partage sur les réseaux.",
    problem:
      "Rendre ludique une activité calme et patiente, sans perdre ce qui la rend utile : savoir ce que l'on a pêché, où, et comment le reconnaître la prochaine fois.",
    story: [
      {
        t: "text",
        kicker: "01",
        title: "Quatre gestes, une prise",
        text:
          "Le parcours tient en quatre écrans. Le viseur de l'appareil photo reprend les équerres du logo. La fiche « Belle prise ! » confirme l'espèce, la date et le lieu. Le poisson rejoint la collection, puis se partage en story.",
      },
      {
        t: "phones",
        items: [
          { src: "assets/projets/fishdex/scan.jpg", alt: "Écran appareil photo avec le viseur FISHDEX autour d'un poisson", label: "Viser" },
          { src: "assets/projets/fishdex/belle-prise.jpg", alt: "Écran « Belle prise ! » : carte du poisson ange avec date et lieu", label: "Identifier" },
          { src: "assets/projets/fishdex/collection.jpg", alt: "Écran collection : 19 poissons sur 19 débloqués", label: "Collectionner", pos: "top" },
          { src: "assets/projets/fishdex/story.jpg", alt: "Story Instagram générée par l'application", label: "Partager" },
        ],
      },
      {
        t: "text",
        kicker: "02",
        title: "Le jeu au service de l'usage",
        text:
          "Chaque mécanique de jeu répond à un besoin concret. La collection garde la trace de ses prises. Le partage fait connaître l'application.",
        points: [
          "Les espèces pas encore trouvées restent en silhouette grise, et un compteur (12/19, 13/19…) montre la progression : on a envie de compléter.",
          "Chaque poisson devient une carte, comme dans un jeu de collection, avec sa fiche : habitat, régime alimentaire, conseils de pêche.",
          "La story indique le rang du pêcheur (« 202ème pêcheur qui débloque le poisson Ange ! ») et contient un QR code : chaque partage invite à télécharger FISHDEX.",
        ],
      },
      {
        t: "split",
        kicker: "03",
        title: "Un logo qui raconte la pêche",
        src: "assets/projets/fishdex/logo.png", w: 1600, h: 700,
        alt: "Logo FISHDEX : un poisson dans un viseur, et le mot en capitales avec son reflet inversé",
        points: [
          ["Le reflet", "Le mot inversé en dessous crée une ligne d'horizon : un reflet sur l'eau, sans dessiner une seule vague."],
          ["Le viseur", "Les quatre équerres de l'icône sont le code universel de l'appareil photo : le poisson est la chose à « capturer »."],
          ["La silhouette", "Un poisson fait de formes géométriques simples, reconnaissable comme un pictogramme et qui vieillit bien."],
        ],
      },
      {
        t: "palette",
        kicker: "04",
        title: "Un camaïeu de bleus",
        text:
          "Le bleu rappelle l'eau et rend le thème immédiat. Ses nuances hiérarchisent l'information sans surcharger l'écran, et sa douceur convient à une activité calme. Climate Crisis donne du caractère aux titres ; Josefin Sans reste lisible sur mobile, même en extérieur.",
        colors: [
          { hex: "#272a94", name: "Indigo FISHDEX" },
          { hex: "#1b4971", name: "Bleu profond" },
          { hex: "#216aa8", name: "Bleu" },
          { hex: "#56a2da", name: "Bleu clair" },
          { hex: "#c5ddf2", name: "Écume" },
          { hex: "#f2f7fc", name: "Blanc" },
          { hex: "#121b27", name: "Nuit" },
        ],
        fonts: [
          { family: "Climate Crisis", role: "Titres", sample: "Belle prise !", size: "2.6em" },
          { family: "Josefin Sans", role: "Textes", sample: "Scan ton poisson, et obtiens des informations sur celui-ci.", size: "1.15em" },
        ],
      },
      {
        t: "text",
        kicker: "05",
        title: "Le site vitrine, ma version",
        text:
          "Après une base commune, chacun de nous a fait évoluer le site à sa façon. Dans ma version, la page plonge sous l'eau au fil du scroll : un seul dégradé du bleu vif au bleu nuit, la carte du poisson ange au centre, puis un requin, un poisson-globe et un sous-marin jusqu'aux algues du fond.",
      },
      {
        t: "scroll",
        items: [
          { src: "assets/projets/fishdex/accueil-desktop.jpg", alt: "Page d'accueil du site FISHDEX, version ordinateur", device: "mac", label: "Ordinateur" },
          { src: "assets/projets/fishdex/accueil-mobile.jpg", alt: "Page d'accueil du site FISHDEX, version mobile", device: "iphone", label: "Mobile" },
        ],
      },
    ],
    results: [
      "Un parcours mobile complet, du scan au partage, prototypé dans Figma.",
      "Une identité visuelle : logo, palette et typographies argumentés.",
      "Un site vitrine pour ordinateur et mobile.",
    ],
    learnings:
      "Un jeu donne envie de revenir, mais ce qui reste, c'est l'utilité : chaque élément ludique doit aussi servir à quelque chose.",
  },

  {
    slug: "borne-edna",
    title: "Borne EDNA",
    type: "Borne interactive",
    year: "2026",
    role: "UX/UI design, ergonomie",
    cadre: "Cours d'ergonomie des interfaces, en binôme",
    tools: ["Figma"],
    cover: "assets/projets/borne-edna/cover.jpg",
    scene: {
      bg: "linear-gradient(170deg, #f1f0ec 0%, #e4e2dc 60%, #d9d7d0 100%)",
      glow: "rgba(255, 255, 255, 0.85)",
      items: [
        { device: "screen", src: "assets/projets/borne-edna/semaine.jpg", wide: [445, 440, 680], narrow: [290, 380, 520], tall: [250, 215, 440] },
        { device: "screen", src: "assets/projets/borne-edna/version-3.jpg", wide: [1155, 440, 680], narrow: [710, 380, 520], tall: [350, 275, 440] },
        { device: "free", src: "assets/projets/borne-edna/borne.jpg", mask: "assets/projets/borne-edna/borne-masque.png", wide: [800, 560, 560], narrow: [500, 560, 560], tall: [300, 650, 430] },
      ],
    },
    stage: "#e6e4de",
    accent: "#c63148",
    fonts: "family=Montserrat:wght@400;700",
    summary:
      "Une borne pour le hall de L'École de Design Nantes Atlantique : météo, bus et tram, emploi du temps et plan du bâtiment, compris en un coup d'œil.",
    context:
      "Projet du cours d'ergonomie des interfaces. La consigne : imaginer une borne pour l'école, de la liste des fonctionnalités jusqu'au prototype Figma et à une maquette papier à l'échelle 1, en faisant évoluer l'interface au fil des échanges.",
    problem:
      "Une borne se consulte debout, en passant, parfois dans une autre langue. Chaque écran doit répondre en quelques secondes à une question précise : où est ma salle ? quand passe mon bus ?",
    story: [
      {
        t: "text",
        kicker: "01",
        title: "Du brainstorming au MVP",
        text:
          "Nous avons d'abord listé sans filtre tout ce qu'une borne pourrait faire, jusqu'à un capteur qui dirait si la file d'attente du micro-ondes est longue. Chaque idée a ensuite été classée selon le niveau d'accès qu'elle demande, puis les fonctions vitales ont été séparées des bonus.",
      },
      {
        t: "columns",
        items: [
          { title: "Public", note: "Sans identification", list: ["Météo", "Horaires des bus et trams", "Plan interactif du bâtiment", "Annuaire de l'équipe enseignante"] },
          { title: "Groupe", note: "Selon la langue, la classe…", list: ["Tutoriels rapides pour les étudiants internationaux", "Interface en anglais"] },
          { title: "Individuel", note: "Avec la carte étudiante", list: ["Emploi du temps personnalisé", "Prise de rendez-vous", "Réservation de salles"] },
        ],
      },
      {
        t: "personas",
        kicker: "02",
        title: "Six personas, six attentes",
        text: "Les personas couvrent tous les publics du hall : étudiants, personnel, enseignants, direction. Leurs attentes ont décidé de ce qui apparaît en premier.",
        items: [
          { name: "Louis", age: "21 ans", role: "Étudiant en 3e année", needs: "Trouver sa salle, savoir où manger à la pause." },
          { name: "Alexandra", age: "26 ans", role: "Étudiante internationale, venue du Chili", needs: "Lire l'interface en anglais, poser une question de façon anonyme." },
          { name: "Jean-Marc", age: "60 ans", role: "Menuisier à l'école", needs: "Météo, horaires, bornes vélo.", limits: "Pas à l'aise avec la technologie." },
          { name: "Fabienne", age: "41 ans", role: "Enseignante en dessin technique", needs: "Une interface belle et soignée.", limits: "Daltonienne." },
          { name: "Mélinda", age: "31 ans", role: "Infirmière de l'école", needs: "Suivre la santé des élèves.", limits: "Très occupée : interactions rapides." },
          { name: "Romain", age: "30 ans", role: "Directeur", needs: "Accès complet aux profils d'élèves.", limits: "Très occupé, habitué au design iOS." },
        ],
      },
      {
        t: "text",
        kicker: "03",
        title: "Du croquis à l'objet",
        text:
          "Une borne d'1,30 m, à l'écran incliné vers la personne, avec un lecteur NFC : on badge sa carte étudiante pour voir son propre emploi du temps.",
      },
      {
        t: "pair",
        items: [
          { src: "assets/projets/borne-edna/croquis.jpg", w: 657, h: 1061, alt: "Croquis au crayon de la borne", caption: "Premier croquis" },
          { src: "assets/projets/borne-edna/rendu-3d.jpg", w: 1884, h: 1203, alt: "Visuel 3D de la borne généré avec l'IA : vue avant, détail de l'interface, profil et vue arrière", caption: "Visuel 3D généré avec l'IA : vue avant, interface, profil (1,30 m), vue arrière" },
        ],
      },
      {
        t: "versions",
        device: "screen",
        kicker: "04",
        title: "Trois versions de l'accueil",
        text: "L'écran d'accueil a été repensé trois fois, avec toujours le même objectif : moins de choix, des réponses plus visibles.",
        items: [
          {
            label: "Version 1",
            src: "assets/projets/borne-edna/version-1.jpg", w: 1600, h: 1034,
            alt: "Version 1 : grandes icônes rondes, emploi du temps et plan du bâtiment",
            text: "Navigation par trois grands boutons ronds. L'écran affiche à la fois l'emploi du temps du jour et le plan interactif du bâtiment, étage par étage.",
          },
          {
            label: "Version 2",
            src: "assets/projets/borne-edna/version-2.jpg", w: 1600, h: 1034,
            alt: "Version 2 : trois cartes empilées, météo, transport et agenda",
            text: "Une barre latérale fine remplace les gros boutons. L'accueil devient trois cartes, une par question : quel temps fait-il, quand passe mon bus, quel est mon prochain cours.",
          },
          {
            label: "Version 3",
            src: "assets/projets/borne-edna/version-3.jpg", w: 1600, h: 1034,
            alt: "Version 3 : météo en bandeau, transports, agenda avec l'emploi du temps du jour",
            text: "La météo se réduit en bandeau et l'agenda prend la place libérée : le prochain cours, la salle, et l'emploi du temps du jour avec un repère « maintenant ».",
          },
        ],
      },
      {
        t: "palette",
        kicker: "05",
        title: "Un système clair et lisible de loin",
        text:
          "Le rouge de l'école pour l'élément actif, du gris pour les cartes, des couleurs douces pour les cours. Les lignes de bus et les cours sont toujours écrits en toutes lettres : la couleur aide, mais ne porte jamais l'information seule.",
        colors: [
          { hex: "#c63148", name: "Rouge EDNA" },
          { hex: "#212121", name: "Navigation" },
          { hex: "#d9d9d9", name: "Cartes" },
          { hex: "#8fbade", name: "Cours" },
          { hex: "#bdb5eb", name: "Ateliers" },
          { hex: "#badec4", name: "Technique" },
          { hex: "#faf5e6", name: "Pause" },
        ],
        fonts: [
          { family: "Montserrat", role: "Titres et textes", sample: "Prochain cours, 14h-18h", size: "2em", weight: 700 },
        ],
      },
      {
        t: "image",
        device: "screen",
        src: "assets/projets/borne-edna/semaine.jpg", w: 1600, h: 1034,
        alt: "Écran de la borne : emploi du temps de la semaine, avec la pause déjeuner",
        caption: "La vue semaine : le jour en cours en rouge, la pause déjeuner signalée sur toute la largeur.",
      },
    ],
    results: [
      "Une liste de fonctionnalités triée par niveau d'accès et par priorité.",
      "Six personas et un prototype Figma de l'interface.",
      "Une maquette papier à l'échelle 1, un visuel 3D généré avec l'IA et trois versions de l'accueil.",
    ],
    learnings:
      "Sur une borne, personne ne lit de mode d'emploi. Chaque écran doit répondre à une seule question : qu'est-ce que la personne vient chercher ?",
  },

  {
    slug: "dj-platform",
    title: "DJ Platform",
    type: "Plateforme web",
    year: "2026",
    role: "UX/UI design",
    cadre: "Projet Design Majeure S2, en binôme",
    tools: ["Figma"],
    cover: "assets/projets/dj-platform/cover.jpg",
    scene: {
      bg: "linear-gradient(160deg, #26095a 0%, #14043a 50%, #090019 100%)",
      glow: "rgba(94, 1, 254, 0.5)",
      items: [
        // scroll : le site défile un peu dans l'écran pendant le recadrage
        { device: "mac", src: "assets/projets/dj-platform/accueil-desktop.jpg", scroll: 0.3, wide: [730, 500, 1180], narrow: [450, 420, 860], tall: [300, 330, 560] },
        { device: "iphone", src: "assets/projets/dj-platform/accueil-mobile.jpg", scroll: 0.25, wide: [1330, 600, 300], narrow: [820, 660, 260], tall: [410, 680, 230] },
      ],
    },
    stage: "#0d0322",
    accent: "#5e01fe",
    fonts: "family=Saira:wght@400;700",
    summary:
      "Trouver et réserver un DJ à partir du lieu de son événement : une carte des DJ proches, des profils pour comparer, la messagerie et la réservation au même endroit.",
    context:
      "Projet de design du second semestre : une plateforme qui met en relation des personnes qui organisent un événement (mariage, soirée, anniversaire) et des DJ.",
    problem:
      "Choisir un DJ, c'est comparer un style, un prix, une date et une distance. L'enjeu : réunir ces critères dans un parcours simple, de la recherche à la réservation.",
    story: [
      {
        t: "text",
        kicker: "01",
        title: "Tout part du lieu",
        text:
          "Une seule question d'entrée : « Où se déroule votre événement ? ». La recherche est présente sur chaque page, et l'accueil montre d'abord les DJ les plus proches sur une carte, avant les DJ récemment réservés, populaires et recommandés.",
      },
      {
        t: "scroll",
        items: [
          { src: "assets/projets/dj-platform/accueil-desktop.jpg", alt: "Page d'accueil de DJ Platform sur ordinateur : carte de Nantes et liste des DJ proches", device: "mac", label: "Ordinateur" },
          { src: "assets/projets/dj-platform/accueil-mobile.jpg", alt: "Page d'accueil de DJ Platform sur mobile", device: "iphone", label: "Mobile" },
        ],
      },
      {
        t: "text",
        kicker: "02",
        title: "La structure d'abord",
        text:
          "Avant tout travail graphique, les wireframes mobiles ont fixé les briques du service : recherche et filtres, profil et galerie, messagerie.",
      },
      {
        t: "phones",
        items: [
          { src: "assets/projets/dj-platform/wireframe-accueil.jpg", alt: "Wireframe mobile : recherche, filtres et grille de DJ", label: "Recherche" },
          { src: "assets/projets/dj-platform/wireframe-profil.jpg", alt: "Wireframe mobile : profil du DJ et galerie", label: "Profil" },
          { src: "assets/projets/dj-platform/wireframe-messages.jpg", alt: "Wireframe mobile : liste des conversations", label: "Messages" },
        ],
      },
      {
        t: "text",
        kicker: "03",
        title: "Une recherche guidée",
        text:
          "Le formulaire reprend les critères qui comptent pour organiser une soirée : type d'événement et de lieu, genres musicaux, équipement en plus, budget maximum, puis la date et l'heure dans un calendrier.",
      },
      {
        t: "image",
        device: "mac",
        src: "assets/projets/dj-platform/recherche.jpg", w: 1512, h: 891,
        alt: "Formulaire de recherche : type d'événement, lieu, genres, équipement, budget, calendrier et heure",
      },
      {
        t: "text",
        kicker: "04",
        title: "Un profil pour décider",
        text:
          "Note, ville, présentation, genres, galerie de soirées et tarif de départ : tout ce qui aide à choisir tient sur un écran, avec deux actions nettes, Contacter ou Réserver. Une fois la date réservée, une confirmation propose de l'ajouter à son agenda.",
      },
      {
        t: "image",
        device: "mac",
        src: "assets/projets/dj-platform/profil.jpg", w: 1512, h: 1191,
        alt: "Profil d'un DJ : note, présentation, genres, galerie, tarifs, boutons Contacter et Réserver",
        caption: "La photo de profil est floutée pour cette présentation.",
      },
      {
        t: "image",
        src: "assets/projets/dj-platform/notification.png", w: 750, h: 402,
        alt: "Confirmation : « Évènement ajouté à votre agenda », avec un bouton Accueil",
        caption: "Après la réservation : la confirmation, et un retour direct à l'accueil.",
        max: 520,
      },
      {
        t: "palette",
        kicker: "05",
        title: "L'ambiance d'une soirée",
        text:
          "Un camaïeu de violets sur un fond presque noir, pour l'univers de la nuit, et Saira, une typographie aux formes carrées et techniques. Les champs de saisie restent très clairs pour être repérés d'un coup d'œil.",
        colors: [
          { hex: "#090019", name: "Nuit" },
          { hex: "#2b0175", name: "Violet 800" },
          { hex: "#4d01d0", name: "Violet 600" },
          { hex: "#5e01fe", name: "Violet 500" },
          { hex: "#985dfe", name: "Violet 300" },
          { hex: "#d2b8ff", name: "Violet 100" },
          { hex: "#efe6ff", name: "Lavande" },
        ],
        fonts: [
          { family: "Saira", role: "Titres et textes", sample: "Trouvez le DJ parfait pour votre événement", size: "1.9em", weight: 700 },
        ],
      },
    ],
    results: [
      "Des wireframes mobiles, puis des maquettes haute fidélité pour ordinateur et mobile.",
      "Un parcours complet : recherche, profil, messagerie, réservation et confirmation.",
      "Un système de couleurs en camaïeu et une échelle typographique.",
    ],
    learnings:
      "Partir du lieu a tout simplifié : une seule question pour commencer, puis chaque écran vient préciser le choix.",
  },
];
