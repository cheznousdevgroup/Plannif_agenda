# Planning vers agenda

Transforme un ou plusieurs plannings exportés d'Outlook (CSV) en rendez-vous dans un agenda : fichier `.ics` (Outlook, iPhone, Android, Google Agenda) ou QR code qu'un autre appareil scanne pour recevoir le planning.

## Contenu du dossier

| Fichier | Rôle |
|---|---|
| `index.ts` | Carte d'identité (`outil`). |
| `composants/Ecran.svelte` | Écran principal : dépôt, liste des fichiers, aperçu, sorties. Aiguille vers la réception selon `sousChemin`. |
| `composants/ReceptionPlanning.svelte` | Écran affiché après scan : `#/planning/recevoir/<données>`. |
| `composants/ScannerQr.svelte` | Scan caméra (lecture via `$lib/qr`). |
| `logique/csv.ts` | Lecture du CSV : encodage ANSI/UTF-8/UTF-16, séparateur `,` ou `;`, colonnes françaises ou anglaises, dates `jj/mm/aaaa` ou `mm/jj/aaaa`. |
| `logique/temps.ts` | Heure de Paris vers UTC (heure d'été comprise). |
| `logique/ics.ts` | Fabrication du `.ics`. |
| `logique/partage.ts` | Format compact et compressé du lien QR, découpage en plusieurs QR, validation des liens reçus. |
| `logique/telechargement.ts` | Envoi vers l'agenda : partage natif ou ouverture sur iOS, téléchargement ailleurs. |
| `logique/planning.test.ts` | Tests (`npm test`). |

## Décisions et limites

- **Tout reste dans le navigateur.** Le planning voyage dans le fragment du lien (`#…`), que le navigateur n'envoie jamais au serveur.
- **Fuseau fixé sur Europe/Paris** (`FUSEAU_PLANNING`, `constantes.ts`) : l'export Outlook ne contient aucun fuseau.
- **iPhone** : un `.ics` téléchargé finit dans l'app Fichiers. En HTTPS on passe par le menu de partage ; en HTTP, par l'ouverture du fichier comme une page. Le menu de partage et la caméra exigent HTTPS (hors `localhost`).
- **Identifiant stable par rendez-vous** (`empreinte`) : réimporter le même planning met à jour au lieu de dupliquer.
- Les lignes sans date lisible sont ignorées et comptées dans l'interface.
- Non géré : ajout direct via l'API Microsoft Graph (demanderait un compte Azure et un serveur).
