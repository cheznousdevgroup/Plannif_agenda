# Contribuer

## Ajouter un nouveau logiciel

1. **Créer une branche** : `outil/<id>` (ex. `outil/factures`).
2. **Générer le squelette** :
   ```bash
   npm run nouvel-outil -- factures "Générateur de factures"
   ```
   Le dossier `src/outils/factures/` est créé et le logiciel apparaît déjà sur l'accueil. Aucun fichier existant à modifier.
3. **Renseigner la carte d'identité** dans `src/outils/factures/index.ts` : titre, résumé en une phrase, icône (liste dans `NomIcone`, `src/lib/types/outils.ts`).
4. **Écrire la logique d'abord**, dans `logique/`, en TypeScript pur, avec ses tests `*.test.ts` à côté (voir `logique/exemple.test.ts`). Pas de composant Svelte ni de DOM dans les fichiers à tester : c'est ce qui permet de les tester sans navigateur. Un état réactif (`*.svelte.ts`) peut cohabiter dans ce dossier, mais il n'est pas couvert par les tests.
5. **Écrire les écrans** dans `composants/`. `Ecran.svelte` reçoit `sousChemin` pour ses sous-écrans (`#/factures/detail/12`).
6. **Remplir le `README.md` du logiciel** : à quoi il sert, formats gérés, décisions non évidentes, limites.
7. **Vérifier** : `npm run check` doit passer sans erreur, et le logiciel doit avoir été essayé dans un navigateur (y compris sur téléphone si l'écran est conçu pour).
8. **Ouvrir la demande de fusion** (checklist ci-dessous).

## Où mettre quoi ?

| Je veux… | Je le mets… |
|---|---|
| Du code utilisé par un seul logiciel | dans le dossier du logiciel |
| Du code dont un 2ᵉ logiciel a besoin | dans `src/lib/<dossier>/` avec un `index.ts` (porte d'entrée) ; l'importer par `$lib/<dossier>` |
| Une nouvelle icône | dessin dans `src/lib/components/Icone.svelte` **et** nom dans `NomIcone` |
| Une couleur ou un style global | variables de `src/app.css` |
| Une dépendance npm | à éviter ; si indispensable, la justifier dans la demande de fusion (poids du bundle, licence) |

Si `npm run check` signale « l'outil X dépend de l'outil Y », ne contourne pas : déplace le code partagé dans `src/lib/`.

## Conventions

- **Français** pour les noms (`construireIcs`, `lireCsv`), les commentaires et les textes d'interface ; types et constantes comme dans le code existant.
- **Commentaires : le pourquoi, jamais le quoi.**
- **Interface** : peu de texte, une action = un bouton clair. États de chargement, d'erreur et de vide traités. Utiliser les variables de couleur du thème (clair et sombre), pas de couleurs en dur.
- **Données utilisateur** : traitées dans le navigateur par défaut. Tout ce qui sort de l'appareil doit être décidé explicitement et écrit dans le `README.md` du logiciel.
- **Entrées extérieures** (fichier déposé, lien, QR) : toujours validées avant usage, comme dans `logique/partage.ts` du logiciel `planning`.
- Pas de code mort, pas de fonctionnalité non demandée.

## Checklist de demande de fusion

- [ ] `npm run check` passe (organisation, tests, types)
- [ ] Logique testée dans `logique/*.test.ts`
- [ ] Essayé dans un navigateur, sur mobile si pertinent, en clair et en sombre
- [ ] `README.md` du logiciel à jour
- [ ] Aucune modification d'un autre logiciel
- [ ] Modification du socle (`src/lib`) : justifiée, et les logiciels existants fonctionnent toujours
