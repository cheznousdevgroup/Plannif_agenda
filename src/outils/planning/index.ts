import type { Outil } from '$lib/types';
import Ecran from './composants/Ecran.svelte';

export const outil: Outil = {
	id: 'planning',
	titre: 'Planning vers agenda',
	resume: 'Vos plannings CSV deviennent des rendez-vous Outlook, ou un QR à scanner.',
	icone: 'agenda',
	Ecran,
};
