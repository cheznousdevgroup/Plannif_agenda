// iPadOS se présente comme un Mac : on le reconnaît à son écran tactile.
const surIos = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

/**
 * Envoie un .ics vers l'agenda. Un fichier téléchargé sur iOS finit dans l'app Fichiers : il faut soit le menu de partage
 * (qui propose Calendrier ; réservé aux pages en HTTPS), soit ouvrir le contenu comme une page. Safari bloque les URL « data: »,
 * d'où le « blob: ». Ailleurs, un téléchargement est ce qu'Outlook et Android attendent.
 */
export async function envoyerVersAgenda(nom: string, ics: string) {
	const fichier = new File([ics], nom, { type: 'text/calendar' });
	if (surIos()) {
		if (navigator.canShare?.({ files: [fichier] })) {
			try {
				await navigator.share({ files: [fichier] });
			} catch {
				// l'utilisateur a refermé le menu de partage : rien à faire
			}
			return;
		}
		location.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
		return;
	}
	const url = URL.createObjectURL(fichier);
	const a = Object.assign(document.createElement('a'), { href: url, download: nom });
	a.click();
	setTimeout(() => URL.revokeObjectURL(url), 1000);
}
