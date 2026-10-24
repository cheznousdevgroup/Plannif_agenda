import type { Component } from 'svelte';

/** Noms des icônes disponibles (dessins dans components/Icone.svelte). Ajouter une icône = l'ajouter ici ET dans Icone.svelte. */
export type NomIcone = 'agenda' | 'qr' | 'fichier' | 'fermer' | 'telecharger' | 'fleche';

/** La carte d'identité d'un logiciel : ce que chaque `src/outils/<id>/index.ts` exporte sous le nom `outil`. */
export interface Outil {
	/** Sert d'adresse (#/<id>) : doit être identique au nom du dossier. */
	id: string;
	titre: string;
	resume: string;
	icone: NomIcone;
	/** L'écran du logiciel. `sousChemin` = reste de l'adresse après #/<id>, pour ses propres sous-écrans. */
	Ecran: Component<{ sousChemin: string[] }>;
}
