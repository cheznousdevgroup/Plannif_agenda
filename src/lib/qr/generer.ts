import QRCode from 'qrcode';

/** Image (data URL) du QR code. Correction d'erreur minimale « L » : plus de place pour les données, l'écran d'un téléphone ne s'abîme pas. */
export function dessinerQr(texte: string): Promise<string> {
	return QRCode.toDataURL(texte, { errorCorrectionLevel: 'L', margin: 2, width: 480 });
}
