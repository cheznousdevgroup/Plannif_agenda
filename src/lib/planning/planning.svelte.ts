import type { FichierPlanning } from '$lib/types';
import { decoderTexte, lireCsv } from './csv.ts';
import { fusionner } from './evenements.ts';

class EtatPlanning {
	fichiers = $state<FichierPlanning[]>([]);
	/** Tous les fichiers réunis, sans doublon, par ordre chronologique. */
	evenements = $derived(fusionner(this.fichiers.flatMap((f) => f.evenements)));

	async ajouter(fichiers: File[]) {
		const lus = await Promise.all(
			fichiers.map(async (f): Promise<FichierPlanning> => {
				const base = { id: crypto.randomUUID(), nom: f.name, evenements: [], ignorees: 0 };
				try {
					return { ...base, ...lireCsv(decoderTexte(await f.arrayBuffer())) };
				} catch (e) {
					return { ...base, erreur: e instanceof Error ? e.message : 'Fichier illisible.' };
				}
			}),
		);
		this.fichiers.push(...lus);
	}

	retirer(id: string) {
		this.fichiers = this.fichiers.filter((f) => f.id !== id);
	}
}

export const planning = new EtatPlanning();
