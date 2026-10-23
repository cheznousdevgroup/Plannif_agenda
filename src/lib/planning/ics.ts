import type { Evenement } from '$lib/types';
import { DOMAINE_UID_ICS, MS_JOUR, PRODID_ICS } from '$lib/constantes';
import { empreinte } from './evenements.ts';

const horodatage = (ms: number) => new Date(ms).toISOString().replace(/[-:]|\.\d{3}/g, '');
const jour = (ms: number) => new Date(ms).toISOString().slice(0, 10).replace(/-/g, '');
const echapper = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');

// RFC 5545 : 75 octets maximum par ligne, la suite commence par une espace. On coupe entre caractères, jamais au milieu d'un accent.
function plier(ligne: string): string {
	const enc = new TextEncoder();
	const morceaux: string[] = [];
	let courant = '';
	let octets = 0;
	for (const c of ligne) {
		const n = enc.encode(c).length;
		if (octets + n > (morceaux.length ? 74 : 75)) {
			morceaux.push(courant);
			courant = '';
			octets = 0;
		}
		courant += c;
		octets += n;
	}
	morceaux.push(courant);
	return morceaux.join('\r\n ');
}

export function construireIcs(evenements: Evenement[]): string {
	const maintenant = horodatage(Date.now());
	const lignes = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:${PRODID_ICS}`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
	for (const e of evenements) {
		const description = [e.description, e.organisateur && `Organisateur : ${e.organisateur}`].filter(Boolean).join('\n');
		lignes.push(
			'BEGIN:VEVENT',
			`UID:${empreinte(e)}@${DOMAINE_UID_ICS}`,
			`DTSTAMP:${maintenant}`,
			// Journée entière : la date de fin du format .ics est exclusive, donc le lendemain du dernier jour.
			...(e.journeeEntiere
				? [`DTSTART;VALUE=DATE:${jour(e.debut)}`, `DTEND;VALUE=DATE:${jour(e.fin + MS_JOUR)}`]
				: [`DTSTART:${horodatage(e.debut)}`, `DTEND:${horodatage(e.fin)}`]),
			`SUMMARY:${echapper(e.titre)}`,
			...(e.lieu ? [`LOCATION:${echapper(e.lieu)}`] : []),
			...(description ? [`DESCRIPTION:${echapper(description)}`] : []),
			'END:VEVENT',
		);
	}
	lignes.push('END:VCALENDAR');
	return lignes.map(plier).join('\r\n') + '\r\n';
}
