# Utilo : consignes permanentes

Application Svelte 5 + TypeScript + Tailwind 4 qui regroupe de petits logiciels utiles. Lire `README.md` (organisation) et `CONTRIBUTING.md` (ajouter un logiciel) avant de coder.

## Règles
- Un logiciel = un dossier `src/outils/<id>/` (créé par `npm run nouvel-outil -- <id> "<Titre>"`). Un logiciel n'importe jamais un autre logiciel ; le code partagé va dans `src/lib/`, qui n'importe jamais un logiciel.
- Logique métier en TypeScript pur dans `logique/`, avec tests `*.test.ts` (Node, `npm test`). Écrans Svelte dans `composants/`.
- Constantes dans `constantes.ts`, types exportés dans `types.ts` (de l'outil), ou dans `src/lib/constantes/` et `src/lib/types/` pour le socle.
- Noms, commentaires et textes en français. Commentaires : le pourquoi, jamais le quoi.
- Données utilisateur traitées dans le navigateur ; toute entrée extérieure (fichier, lien, QR) est validée avant usage.
- Interface sobre, peu de texte, couleurs via les variables de `src/app.css` (clair et sombre). Pas d'emoji.

## Manière de travailler
- Si la demande a un défaut ou une meilleure alternative, le dire avant de coder.
- Vérifier réellement (`npm run check`, navigateur) et dire ce qui n'a pas pu l'être. Ne jamais déclarer « terminé » sans preuve.
- Pas de sur-ingénierie, pas de code mort, pas de fonctionnalité non demandée.
- Ne rien commiter sans demande explicite.
