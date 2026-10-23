import jsQR from 'jsqr';

/**
 * Ouvre la caméra arrière dans `video` et appelle `siTrouve` à chaque QR code lu (le scan continue : à l'appelant d'arrêter).
 * Renvoie la fonction qui coupe la caméra. Rejette si la caméra est refusée ou absente.
 */
export async function demarrerScan(video: HTMLVideoElement, siTrouve: (texte: string) => void): Promise<() => void> {
	const flux = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
	video.srcObject = flux;
	await video.play();

	const toile = document.createElement('canvas');
	const ctx = toile.getContext('2d', { willReadFrequently: true })!;
	let actif = true;
	let image = 0;
	const boucle = () => {
		if (!actif) return;
		// Analyser une image sur deux suffit et ménage la batterie ; jsQR est lent sur de grandes images, d'où le plafond de 640 px.
		if (video.readyState === video.HAVE_ENOUGH_DATA && image++ % 2 === 0) {
			const echelle = Math.min(1, 640 / video.videoWidth);
			toile.width = Math.round(video.videoWidth * echelle);
			toile.height = Math.round(video.videoHeight * echelle);
			ctx.drawImage(video, 0, 0, toile.width, toile.height);
			const donnees = ctx.getImageData(0, 0, toile.width, toile.height);
			const trouve = jsQR(donnees.data, donnees.width, donnees.height, { inversionAttempts: 'dontInvert' });
			if (trouve?.data) siTrouve(trouve.data);
		}
		requestAnimationFrame(boucle);
	};
	requestAnimationFrame(boucle);

	return () => {
		actif = false;
		flux.getTracks().forEach((t) => t.stop());
		video.srcObject = null;
	};
}
