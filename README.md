# Utilo

Une application web de petits logiciels qui rendent service. Chaque logiciel est indépendant, vit dans son propre dossier et apparaît automatiquement sur l'accueil.

Logiciels disponibles : voir [`src/outils/`](src/outils/) (un dossier = un logiciel, chacun avec son `README.md`).

## Démarrer

```bash
npm install
npm run dev        # http://localhost:5173 (et l'adresse réseau affichée, pour tester sur téléphone)
npm run check      # organisation du code + tests + types : à passer avant toute demande de fusion
npm test           # tests seuls
npm run build
```

Prérequis : Node 22 ou plus récent.

## Organisation

```
src/
├── lib/                  LE SOCLE : ce qui sert à plusieurs logiciels
│   ├── components/       composants partagés (en-tête, accueil, icônes)
│   ├── outils/           découverte automatique des logiciels (ne pas toucher)
│   ├── qr/               génération et lecture de QR codes
│   ├── routage/          navigation par « # »
│   └── types/            types partagés (dont `Outil`, la carte d'identité d'un logiciel)
├── outils/               LES LOGICIELS : un dossier par logiciel
│   └── <id>/
│       ├── index.ts      carte d'identité (`outil`) : seul point d'entrée
│       ├── composants/   écrans Svelte (`Ecran.svelte` = écran principal)
│       ├── logique/      code métier en TypeScript pur + tests `*.test.ts`
│       ├── types.ts      types propres au logiciel
│       ├── constantes.ts constantes propres au logiciel
│       └── README.md     à quoi ça sert, décisions, limites
├── App.svelte            affiche l'accueil ou l'écran du logiciel choisi
└── app.css               thème (couleurs en variables CSS)
scripts/
├── nouvel-outil.mjs      crée un logiciel à partir du modèle
├── modele-outil/         le modèle copié par la commande ci-dessus
└── verifier-organisation.mjs   fait respecter les règles ci-dessous
```

## Les règles (vérifiées automatiquement par `npm run check`)

1. **Un logiciel ne connaît pas les autres.** Ce qui sert à deux logiciels monte dans `src/lib/`.
2. **Le socle ne connaît aucun logiciel.**
3. **Une porte d'entrée par dossier du socle** : on importe `$lib/qr`, jamais `$lib/qr/scanner`.
4. **Constantes** (`NOM_EN_MAJUSCULES`) dans `constantes.ts`, **types exportés** dans `types.ts`.
5. Le nom du dossier d'un logiciel est son `id` (et son adresse : `#/<id>`).

## Ajouter une fonctionnalité

Voir [CONTRIBUTING.md](CONTRIBUTING.md). En bref : `npm run nouvel-outil -- mon-outil "Mon outil"`.
