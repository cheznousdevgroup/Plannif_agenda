import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decoderTexte, lireCsv } from './csv.ts';
import { fusionner } from './evenements.ts';
import { construireIcs } from './ics.ts';
import { decoder, encoder, extraireCharge, liensPourQr } from './partage.ts';

const ENTETE =
	'"Objet","Début","Début","Fin","Fin","Journée entière","Rappel actif/inactif","Date de rappel","Heure du rappel","Organisateur d\'une réunion","Participants obligatoires","Participants facultatifs","Ressources de la réunion","Afficher la disponibilité","Catégories","Critère de diffusion","Description","Emplacement","Informations facturation","Kilométrage","Priorité","Privé"';
const ligne = (titre: string, date: string, de: string, a: string, orga: string) =>
	`"${titre}","${date}","${de}:00","${date}","${a}:00","Faux","Faux","","","${orga}","M X",,,"2",,,"Description de ${titre}","Centre FOD     - Salle Internet",,,"Normale","Faux"`;

// Un export Outlook réel est en Windows-1252 : on le reproduit en latin1 pour tester le vrai chemin de décodage.
const exportAnsi = (lignes: string[]) => {
	const b = Buffer.from([ENTETE, ...lignes].join('\r\n'), 'latin1');
	return b.buffer.slice(b.byteOffset, b.byteOffset + b.length) as ArrayBuffer;
};

const lire = () =>
	lireCsv(
		decoderTexte(
			exportAnsi([
				ligne('UTC502 - Webconférence', '14/10/2026', '18:30', '19:30', 'Mme MIGEON-TOURTE Christine'),
				ligne('RCP105 - Webconférence', '29/03/2027', '19:30', '20:30', 'M MOREAU Laurent'),
			]),
		),
	);

test('lit un export ANSI français, accents et espaces compris', () => {
	const { evenements, ignorees } = lire();
	assert.equal(evenements.length, 2);
	assert.equal(ignorees, 0);
	assert.equal(evenements[0].titre, 'UTC502 - Webconférence');
	assert.equal(evenements[0].lieu, 'Centre FOD - Salle Internet');
	assert.equal(evenements[0].organisateur, 'Mme MIGEON-TOURTE Christine');
});

test("convertit l'heure de Paris en UTC, y compris après le passage à l'heure d'été", () => {
	const [octobre, mars] = lire().evenements;
	assert.equal(new Date(octobre.debut).toISOString(), '2026-10-14T16:30:00.000Z'); // UTC+2
	assert.equal(new Date(mars.debut).toISOString(), '2027-03-29T17:30:00.000Z'); // UTC+2 (été depuis le 28/03/2027)
});

test('refuse un CSV qui n\'est pas un export d\'agenda', () => {
	assert.throws(() => lireCsv('a,b\n1,2'), /colonnes/);
});

test('fusionne sans doublon', () => {
	const { evenements } = lire();
	assert.equal(fusionner([...evenements, ...evenements]).length, 2);
});

test('produit un .ics valide : lignes pliées à 75 octets, heures en UTC', () => {
	const ics = construireIcs(lire().evenements);
	assert.ok(ics.includes('DTSTART:20261014T163000Z'));
	assert.ok(ics.split('\r\n').every((l) => new TextEncoder().encode(l).length <= 75));
});

test('aller-retour du lien QR sans perte', async () => {
	const { evenements } = lire();
	assert.deepEqual(await decoder(await encoder(evenements)), evenements);
});

test('un gros planning reste dans la taille d\'un QR', async () => {
	(globalThis as { location?: unknown }).location = { origin: 'https://exemple.test', pathname: '/' };
	const [base] = lire().evenements;
	const gros = Array.from({ length: 200 }, (_, i) => ({ ...base, titre: `Cours ${i % 9}`, debut: base.debut + i * 3_600_000, fin: base.fin + i * 3_600_000 }));
	for (const lien of await liensPourQr(gros)) assert.ok(lien.length <= 1700 && extraireCharge(lien));
});

test('rejette les liens malformés ou hostiles', async () => {
	for (const mauvais of ['', 'abc', '!!!', 'eJzLSM3JyQcABiwCFQ', 'A'.repeat(40_000)]) await assert.rejects(decoder(mauvais));
});
