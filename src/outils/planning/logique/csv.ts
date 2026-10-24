import type { Evenement, LectureCsv } from '../types.ts';
import { murVersUtc } from './temps.ts';

/** Les exports Outlook sont en ANSI (Windows-1252) : on tente l'UTF-8 strict, sinon on retombe sur l'ANSI. */
export function decoderTexte(octets: ArrayBuffer): string {
	const v = new Uint8Array(octets);
	if (v[0] === 0xff && v[1] === 0xfe) return new TextDecoder('utf-16le').decode(v);
	try {
		return new TextDecoder('utf-8', { fatal: true }).decode(v);
	} catch {
		return new TextDecoder('windows-1252').decode(v);
	}
}

function parserCsv(texte: string, sep: string): string[][] {
	const lignes: string[][] = [];
	let ligne: string[] = [];
	let champ = '';
	let guillemets = false;
	const finDeLigne = () => {
		ligne.push(champ);
		champ = '';
		if (ligne.some((c) => c !== '')) lignes.push(ligne);
		ligne = [];
	};
	for (let i = 0; i < texte.length; i++) {
		const c = texte[i];
		if (guillemets) {
			if (c !== '"') champ += c;
			else if (texte[i + 1] === '"') {
				champ += '"';
				i++;
			} else guillemets = false;
		} else if (c === '"') guillemets = true;
		else if (c === sep) {
			ligne.push(champ);
			champ = '';
		} else if (c === '\n' || c === '\r') {
			if (c === '\r' && texte[i + 1] === '\n') i++;
			finDeLigne();
		} else champ += c;
	}
	if (champ !== '' || ligne.length) finDeLigne();
	return lignes;
}

const normaliser = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');

function parserDate(texte: string, moisAvantJour: boolean): [number, number, number] | null {
	const m = texte.trim().match(/^(\d{1,4})[/.-](\d{1,2})[/.-](\d{1,4})$/);
	if (!m) return null;
	const [a, b, c] = [Number(m[1]), Number(m[2]), Number(m[3])];
	let annee: number, mois: number, jour: number;
	if (m[1].length === 4) [annee, mois, jour] = [a, b, c];
	else {
		annee = c < 100 ? 2000 + c : c;
		[mois, jour] = moisAvantJour ? [a, b] : [b, a];
	}
	if (mois < 1 || mois > 12 || jour < 1 || jour > 31) return null;
	return [annee, mois, jour];
}

function parserHeure(texte: string): [number, number] | null {
	const m = texte.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([ap]m)?$/i);
	if (!m) return null;
	let h = Number(m[1]);
	if (m[3]) h = (h % 12) + (m[3].toLowerCase() === 'pm' ? 12 : 0);
	return h > 23 || Number(m[2]) > 59 ? null : [h, Number(m[2])];
}

const estVrai = (s: string) => ['vrai', 'true', 'oui', 'yes'].includes(normaliser(s));

/** Lit un export CSV d'agenda Outlook (colonnes françaises ou anglaises, séparateur « , » ou « ; »). */
export function lireCsv(texte: string): LectureCsv {
	const premiere = texte.split(/\r?\n/, 1)[0] ?? '';
	const sep = premiere.split(';').length > premiere.split(',').length ? ';' : ',';
	const [entetes, ...lignes] = parserCsv(texte, sep);
	if (!entetes) throw new Error('Fichier vide.');

	const noms = entetes.map(normaliser);
	const colonnes = (...alias: string[]) => noms.flatMap((n, i) => (alias.includes(n) ? [i] : []));
	const objet = colonnes('objet', 'subject')[0];
	const dateDebut = colonnes('debut', 'startdate')[0];
	if (objet === undefined || dateDebut === undefined)
		throw new Error("Ce fichier n'a pas les colonnes d'un export d'agenda Outlook (Objet, Début, Fin).");
	// En français « Début » et « Fin » apparaissent deux fois (date puis heure), en anglais ce sont des colonnes distinctes.
	const heureDebut = colonnes('starttime')[0] ?? colonnes('debut')[1];
	const dateFin = colonnes('enddate')[0] ?? colonnes('fin')[0];
	const heureFin = colonnes('endtime')[0] ?? colonnes('fin')[1];
	const entiere = colonnes('journeeentiere', 'alldayevent')[0];
	const description = colonnes('description')[0];
	const lieu = colonnes('emplacement', 'location')[0];
	const organisateur = colonnes('organisateurdunereunion', 'meetingorganizer')[0];
	const anglais = noms.includes('subject');

	const evenements: Evenement[] = [];
	let ignorees = 0;
	for (const l of lignes) {
		const cell = (i: number | undefined) => (i === undefined ? '' : (l[i] ?? '').trim());
		const d0 = parserDate(cell(dateDebut), anglais);
		if (!d0) {
			ignorees++;
			continue;
		}
		const d1 = parserDate(cell(dateFin), anglais) ?? d0;
		const journeeEntiere = estVrai(cell(entiere));
		let debut: number, fin: number;
		if (journeeEntiere) {
			debut = Date.UTC(d0[0], d0[1] - 1, d0[2]);
			fin = Math.max(debut, Date.UTC(d1[0], d1[1] - 1, d1[2]));
		} else {
			const h0 = parserHeure(cell(heureDebut)) ?? [0, 0];
			const h1 = parserHeure(cell(heureFin)) ?? h0;
			debut = murVersUtc(d0[0], d0[1], d0[2], h0[0], h0[1]);
			fin = Math.max(debut, murVersUtc(d1[0], d1[1], d1[2], h1[0], h1[1]));
		}
		evenements.push({
			titre: cell(objet) || '(sans titre)',
			debut,
			fin,
			journeeEntiere,
			description: cell(description),
			lieu: cell(lieu).replace(/\s{2,}/g, ' '),
			organisateur: cell(organisateur),
		});
	}
	return { evenements, ignorees };
}
