import type { Outil } from '$lib/types';
import Ecran from './composants/Ecran.svelte';

// La carte d'identité du logiciel : c'est ce fichier qui le fait apparaître sur l'accueil. Rien d'autre à enregistrer.
export const outil: Outil = {
	id: '__ID__', // doit rester identique au nom du dossier
	titre: __TITRE_JSON__,
	resume: 'À compléter en une phrase.',
	icone: 'fichier', // voir NomIcone dans src/lib/types/outils.ts
	Ecran,
};
