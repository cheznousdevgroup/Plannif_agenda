import type { Outil } from '$lib/types';

// Découverte automatique : tout dossier src/outils/<id>/ qui exporte `outil` dans son index.ts apparaît sur l'accueil.
// C'est le SEUL endroit où le socle regarde dans src/outils ; ajouter un logiciel ne demande donc de toucher à aucun fichier existant.
const modules = import.meta.glob<{ outil: Outil }>('../../outils/*/index.ts', { eager: true });

export const catalogue: Outil[] = Object.values(modules)
	.map((m) => m.outil)
	.sort((a, b) => a.titre.localeCompare(b.titre));
