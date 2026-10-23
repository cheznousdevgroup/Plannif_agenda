import { FUSEAU_PLANNING } from '$lib/constantes';

const formateurs = new Map<string, Intl.DateTimeFormat>();

// Écart (ms) entre l'heure affichée dans `fuseau` et l'UTC à l'instant `instant`. Passe par Intl pour suivre l'heure d'été.
function decalage(instant: number, fuseau: string): number {
	let f = formateurs.get(fuseau);
	if (!f) {
		f = new Intl.DateTimeFormat('en-US', { timeZone: fuseau, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
		formateurs.set(fuseau, f);
	}
	const p: Record<string, number> = {};
	for (const part of f.formatToParts(new Date(instant))) p[part.type] = Number(part.value);
	return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(instant / 1000) * 1000;
}

/** Convertit une date/heure « murale » du fuseau du planning en instant UTC. */
export function murVersUtc(annee: number, mois: number, jour: number, heure: number, minute: number, fuseau = FUSEAU_PLANNING): number {
	const naif = Date.UTC(annee, mois - 1, jour, heure, minute);
	// Deux passes : l'écart doit être mesuré à l'instant final, qui peut tomber de l'autre côté d'un changement d'heure.
	const approx = naif - decalage(naif, fuseau);
	return naif - decalage(approx, fuseau);
}
