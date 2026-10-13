# Portfolio : mode d'emploi

## Voir le site

- **Le plus simple** : double-clique sur `index.html`.
- **Comme en ligne** (recommandé pour tester les transitions entre pages) : dans un terminal ouvert dans ce dossier, lance `node server.js`, puis ouvre http://localhost:5173

## Modifier le contenu

| Je veux changer…                    | Fichier                                   |
| ----------------------------------- | ----------------------------------------- |
| Mes projets (textes, images)        | `js/projects.js`                          |
| Accueil, À propos, parcours, liens  | `index.html` (cherche les commentaires `<!-- ... -->`) |
| Couleurs, polices, espacements      | `css/style.css`, tout en haut (`:root`)   |
| Mon CV                              | remplace `assets/CV.pdf` en gardant ce nom ; les boutons du site le téléchargent sous le nom `CV-Clarence-Seguy-Houel.pdf` |
| L'image d'« À propos »             | `assets/postit-signature.jpg` (la signature sur un post-it jaune collé sur un mur rose) ; change le `src` dans `index.html` pour en mettre une autre |
| Mon logo (la signature)             | `js/signature.js` : le dessin et les traits du stylo pour l'animation d'écriture ; `assets/signature.svg` : la même signature en image (sans JavaScript). Les fichiers sources sont dans `Visuel/logo/` |
| Couleurs de l'identité              | `css/style.css`, tout en haut : la palette (rouge #BD001E, rose #FAB3A9, jaune #F4D35E, marine #1D1E2C, cyan #DDFDFE), puis les couleurs du thème clair (`:root`) et du thème sombre (`[data-theme="dark"]`) |
| La vue éclatée des écrans           | calques dans `assets/projets/<slug>/calques/` (exportés de Figma), réglages dans `explode` de chaque projet (`js/projects.js`) |
| Le mur d'écrans du haut de page     | miniatures dans `assets/mur/`, liste en haut de `js/home.js` (`WALL`) |
| La phrase « Je recherche un stage… » | `index.html`, dernière phrase sous le grand titre |

Les images de projets vont dans `assets/projets/<slug>/` (un dossier par projet).
La page d'un projet se construit avec la liste `story` de `js/projects.js` : une suite de blocs
(texte, écrans de téléphone, page qui défile, versions à onglets, palette, personas…).
Le mode d'emploi de chaque bloc est en haut de `js/projects.js`.

Chaque projet a sa page automatiquement : `projet.html?p=<slug>` (le `slug` est défini dans `js/projects.js`).

Typographie : dans les titres, les petits mots (le, la, une, de, au, six…) ne restent jamais seuls
en fin de ligne, ils passent à la ligne avec le mot suivant (« Quatre gestes, / une prise »).
C'est automatique (`PF.typo` dans `js/common.js`), y compris pour les nouveaux textes. Les espaces
insécables avant : ; ! ? sont aussi ajoutées toutes seules.

## Animations

Arrivée sur le site : sur fond rouge, la signature s'écrit au stylo, puis rejoint le centre
de la barre du haut pendant que le rideau se lève sur le haut de page.
Un geste (molette, clic, touche) pendant l'écriture l'accélère. L'animation ne se rejoue pas
quand on revient d'une page projet (elle se rejoue si on recharge la page).
Au survol, la signature de la barre du haut se réécrit ; en bas de chaque page, elle s'écrit en grand.

Haut de page : derrière le titre, un mur incliné en 3D fait défiler les écrans des projets
et suit doucement la souris.

Navigation par étapes : sur l'accueil, un seul geste (cran de molette, glissement du doigt,
flèche ↓ ou ↑ du clavier) passe du haut de page au premier projet, puis d'un projet à l'autre ;
l'animation se joue toute seule. Chaque projet arrive incliné, comme un écran que l'on redresse.
Après le dernier projet, le scroll redevient normal.

Vue éclatée : après les projets, un écran de chaque projet (FISHDEX, la borne, DJ Platform)
arrive en calques séparés qui flottent en 3D, puis se rassemblent au fil du scroll pour former
l'interface. La même vue se trouve dans chaque page projet. Pour en ajouter un, exporte les
calques depuis Figma dans `assets/projets/<slug>/calques/` et décris-les dans `explode`
(position x, y et largeur w de chaque calque dans l'écran Figma).

Pages projet : quand une page de site défile dans un écran (MacBook, iPhone), l'appareil reste
fixe à l'écran le temps que la page défile, puis la lecture reprend.

Thème clair / sombre : le bouton lune / soleil de la barre du haut. Le choix est gardé ;
sans choix, le site suit le réglage de l'ordinateur.

Couvertures des projets : les écrans sont posés sur des iPhone et MacBook dessinés en CSS,
inclinés en 3D (réglage `tilt` de chaque appareil dans `js/projects.js`) ; sur ordinateur,
ils s'inclinent un peu plus sous la souris.
Quand l'image se recadre pour laisser la place aux détails, les appareils se rapprochent
et se réorganisent pour rester entiers dans le cadre. Leur place se règle dans `scene`
(`js/projects.js`), pour trois formes de cadre : large, carré et haut.

Les animations sont toujours actives, pour tout le monde, même si l'ordinateur du
visiteur demande de réduire les animations (réglage d'accessibilité de Windows ou macOS).
Si tu changes d'avis, c'est la ligne `classList.add("js", "motion")` dans le `<head>`
de `index.html` et `projet.html`.

Si tu vois encore une ancienne version : recharge avec Ctrl+F5.

## Avant de publier : à remplacer

- [x] Les projets : FISHDEX, Borne EDNA et DJ Platform, tirés de Figma (`js/projects.js`)
- [x] Textes des projets relus et alignés sur le CV
- [x] Le CV (`assets/CV.pdf`)
- [x] L'image d'« À propos » : la signature sur un post-it
- [x] Le parcours (`index.html`, section À propos)
- [x] Le lien LinkedIn (section Contact de `index.html`)
- [x] Compétences, logiciels et citation relus (logiciels alignés sur le CV)

## En ligne (GitHub Pages)

- Dépôt : https://github.com/ClarenceSGH/portfolio
- Adresse du site : **https://clarencesgh.github.io/portfolio/**

Le dossier `Visuel/` et le dossier `.claude/` restent sur ton ordinateur, ils ne sont pas publiés
(voir `.gitignore`). Le fichier `.nojekyll` sert à publier les fichiers tels quels.

Première mise en ligne : dans le dépôt, *Settings › Pages › Build and deployment* :
Source « Deploy from a branch », branche `main`, dossier `/ (root)`, puis *Save*.

Pour une mise à jour : modifie tes fichiers, puis, dans un terminal ouvert dans ce dossier :

```
git add -A
git commit -m "Mise à jour du portfolio"
git push
```

Le site se met à jour 1 à 2 minutes après (recharge avec Ctrl+F5 si besoin).

## Google

- `google7d03f6697d4d451d.html` prouve à Google Search Console que le site est à toi : ne le supprime pas.
- `sitemap.xml` liste les pages du site pour Google. Si tu ajoutes un projet, ajoute sa page
  (`projet.html?p=<slug>`) dans ce fichier.
