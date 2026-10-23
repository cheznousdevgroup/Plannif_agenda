import type { Evenement } from '$lib/types';

/** Empreinte stable d'un rendez-vous : sert à retirer les doublons et d'identifiant dans le .ics (réimporter met à jour, ne duplique pas). */
export function empreinte(e: Evenement): string {
	let h = 0x811c9dc5;
	for (const c of `${e.debut}|${e.fin}|${e.titre}`) h = Math.imul(h ^ c.codePointAt(0)!, 0x01000193);
	return (h >>> 0).toString(16).padStart(8, '0');
}

/** Rassemble plusieurs plannings : sans doublon, dans l'ordre chronologique. */
export function fusionner(evenements: Evenement[]): Evenement[] {
	const vus = new Map<string, Evenement>();
	for (const e of evenements) vus.set(empreinte(e), e);
	return [...vus.values()].sort((a, b) => a.debut - b.debut || a.titre.localeCompare(b.titre));
}
