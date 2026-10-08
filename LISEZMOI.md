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
| L'image d'« À propos »             | `assets/postit-logo.jpg` (le logo sur un post-it collé au mur) ; change le `src` dans `index.html` pour en mettre une autre |
| Mon logo                            | `assets/logo.png` (grande taille) et `assets/logo-bold.png` (trait épaissi pour la petite taille dans la barre du haut) |

Les images de projets vont dans `assets/projets/<slug>/` (un dossier par projet).
La page d'un projet se construit avec la liste `story` de `js/projects.js` : une suite de blocs
(texte, écrans de téléphone, page qui défile, versions à onglets, palette, personas…).
Le mode d'emploi de chaque bloc est en haut de `js/projects.js`.

Chaque projet a sa page automatiquement : `projet.html?p=<slug>` (le `slug` est défini dans `js/projects.js`).

## Animations

Navigation par étapes : sur l'accueil, un seul geste (cran de molette, glissement du doigt,
flèche ↓ ou ↑ du clavier) passe du logo au premier projet, puis d'un projet à l'autre ;
l'animation se joue toute seule. Après le dernier projet, le scroll redevient normal.

Couvertures des projets : les écrans sont posés sur des iPhone et MacBook dessinés en CSS.
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
- [x] L'image d'« À propos » : le logo smiley sur un post-it
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
