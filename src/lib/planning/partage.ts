import type { Evenement } from '$lib/types';
import { MAX_CARACTERES_LIEN, MS_JOUR, MS_MINUTE, MAX_EVENEMENTS_LIEN, MAX_OCTETS_DECOMPRESSES, MAX_TEXTE_LIEN, ROUTE_RECEPTION, TAILLE_MAX_LIEN_QR, VERSION_FORMAT_LIEN } from '$lib/constantes';

// Format compact : les textes répétés (titre, lieu, description…) sont stockés une seule fois dans un dictionnaire `s`,
// chaque rendez-vous n'étant plus que des nombres. Puis compression : c'est ce qui fait tenir un semestre dans un QR.
// Rendez-vous = [début (min), durée (min, ou jours si journée entière), titre, description, lieu, organisateur, journée entière 0|1]
interface Lien {
	v: number;
	s: string[];
	d: number[][];
}


async function lireFlux(flux: ReadableStream<Uint8Array>, plafond: number): Promise<Uint8Array> {
	const parts: Uint8Array[] = [];
	let total = 0;
	const lecteur = flux.getReader();
	for (;;) {
		const { done, value } = await lecteur.read();
		if (done) break;
		total += value.length;
		// Un lien malveillant pourrait se décompresser en gigaoctets : on coupe dès le plafond.
		if (total > plafond) {
			await lecteur.cancel();
			throw new Error('Lien invalide.');
		}
		parts.push(value);
	}
	const sortie = new Uint8Array(total);
	let pos = 0;
	for (const p of parts) {
		sortie.set(p, pos);
		pos += p.length;
	}
	return sortie;
}

const versBase64Url = (o: Uint8Array) =>
	btoa(Array.from(o, (b) => String.fromCharCode(b)).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const depuisBase64Url = (s: string) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

export async function encoder(evenements: Evenement[]): Promise<string> {
	const dico: string[] = [];
	const index = new Map<string, number>();
	const ref = (t: string) => {
		let i = index.get(t);
		if (i === undefined) {
			i = dico.length;
			dico.push(t);
			index.set(t, i);
		}
		return i;
	};
	const d = evenements.map((e) => [
		Math.round(e.debut / MS_MINUTE),
		e.journeeEntiere ? Math.round((e.fin - e.debut) / MS_JOUR) : Math.round((e.fin - e.debut) / MS_MINUTE),
		ref(e.titre),
		ref(e.description),
		ref(e.lieu),
		ref(e.organisateur),
		e.journeeEntiere ? 1 : 0,
	]);
	const json = JSON.stringify({ v: VERSION_FORMAT_LIEN, s: dico, d } satisfies Lien);
	const flux = new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'));
	return versBase64Url(await lireFlux(flux, Infinity));
}

export async function decoder(charge: string): Promise<Evenement[]> {
	const invalide = () => new Error('Ce lien ou ce QR code est illisible.');
	if (!charge || charge.length > MAX_CARACTERES_LIEN || !/^[\w-]+$/.test(charge)) throw invalide();
	let lien: Lien;
	try {
		const flux = new Blob([depuisBase64Url(charge) as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
		lien = JSON.parse(new TextDecoder().decode(await lireFlux(flux, MAX_OCTETS_DECOMPRESSES)));
	} catch {
		throw invalide();
	}
	// Tout ce qui vient d'un lien est invérifiable : on contrôle chaque champ avant de le laisser atteindre l'écran.
	const nombre = (x: unknown): x is number => typeof x === 'number' && Number.isSafeInteger(x) && x >= 0;
	if (lien?.v !== VERSION_FORMAT_LIEN || !Array.isArray(lien.s) || !Array.isArray(lien.d)) throw invalide();
	if (lien.d.length > MAX_EVENEMENTS_LIEN || lien.s.some((t) => typeof t !== 'string' || t.length > MAX_TEXTE_LIEN)) throw invalide();
	const texte = (i: unknown) => {
		if (!nombre(i) || i >= lien.s.length) throw invalide();
		return lien.s[i];
	};
	return lien.d.map((r) => {
		if (!Array.isArray(r) || r.length !== 7 || !r.every(nombre) || r[0] > 100_000_000 || r[1] > 600_000) throw invalide();
		const journeeEntiere = r[6] === 1;
		const debut = r[0] * MS_MINUTE;
		return {
			titre: texte(r[2]),
			description: texte(r[3]),
			lieu: texte(r[4]),
			organisateur: texte(r[5]),
			debut,
			fin: debut + r[1] * (journeeEntiere ? MS_JOUR : MS_MINUTE),
			journeeEntiere,
		};
	});
}

const prefixeLien = () => `${location.origin}${location.pathname}#/planning/${ROUTE_RECEPTION}/`;

/** Un ou plusieurs liens, chacun assez court pour un QR code, qui ouvrent l'écran de réception du planning. */
export async function liensPourQr(evenements: Evenement[]): Promise<string[]> {
	const prefixe = prefixeLien();
	const decouper = async (lot: Evenement[]): Promise<string[]> => {
		const lien = prefixe + (await encoder(lot));
		if (lien.length <= TAILLE_MAX_LIEN_QR || lot.length === 1) return [lien];
		const milieu = Math.ceil(lot.length / 2);
		return [...(await decouper(lot.slice(0, milieu))), ...(await decouper(lot.slice(milieu)))];
	};
	return evenements.length ? decouper(evenements) : [];
}

/** Retrouve la charge utile dans le texte lu par le scanner (lien complet, quel que soit l'hébergement de l'app). */
export function extraireCharge(texte: string): string | null {
	return texte.match(new RegExp(`#/planning/${ROUTE_RECEPTION}/([\\w-]+)$`))?.[1] ?? null;
}
