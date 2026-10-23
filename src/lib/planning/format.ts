import type { Evenement } from '$lib/types';
import { FUSEAU_PLANNING, LANGUE_AFFICHAGE } from '$lib/constantes';

// Les rendez-vous « journée entière » sont stockés à minuit UTC : on les affiche en UTC pour ne pas les décaler d'un jour.
const fuseau = (e: Evenement) => (e.journeeEntiere ? 'UTC' : FUSEAU_PLANNING);

export const jourCourt = (e: Evenement) =>
	new Intl.DateTimeFormat(LANGUE_AFFICHAGE, { weekday: 'short', day: 'numeric', timeZone: fuseau(e) }).format(e.debut);

export const mois = (e: Evenement) =>
	new Intl.DateTimeFormat(LANGUE_AFFICHAGE, { month: 'long', year: 'numeric', timeZone: fuseau(e) }).format(e.debut);

export function plage(e: Evenement): string {
	if (e.journeeEntiere) return 'Journée';
	const h = new Intl.DateTimeFormat(LANGUE_AFFICHAGE, { hour: '2-digit', minute: '2-digit', timeZone: FUSEAU_PLANNING });
	return `${h.format(e.debut)} – ${h.format(e.fin)}`;
}
