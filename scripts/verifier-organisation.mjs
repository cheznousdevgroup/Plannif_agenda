// Vérifie l'organisation du code : « le socle partagé (src/lib) + un dossier par logiciel (src/outils/<id>) ».
//
// Règles contrôlées :
//   1. Dans src/lib, chaque dossier de fonctionnalité a un index.ts, et on l'importe par cette porte d'entrée
//      (« $lib/qr »), jamais par un fichier précis (« $lib/qr/scanner »). Valable aussi depuis les outils.
//   2. Le socle ne dépend jamais d'un outil (seule exception : la découverte automatique, via import.meta.glob).
//   3. Un outil ne dépend jamais d'un autre outil : ce qui sert à deux outils monte dans src/lib.
//   4. Chaque outil a un index.ts qui exporte `outil` (sa carte d'identité), et son dossier porte le même nom que son id.
//   5. Constantes (NOM_EN_MAJUSCULES) : dans constantes/ (socle) ou constantes.ts (outil). Types exportés : dans types/ ou types.ts.
//
// Usage : node scripts/verifier-organisation.mjs   (code de sortie 1 s'il y a un problème)
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(RACINE, 'src');
const LIB = join(SRC, 'lib');
const OUTILS = join(SRC, 'outils');

// Dossiers qui n'ont pas à suivre la règle (composants Svelte partagés)
const EXCEPTIONS_DOSSIERS = new Set(['components']);

const sousDossiers = (d) => (existsSync(d) ? readdirSync(d).filter((n) => statSync(join(d, n)).isDirectory()) : []);

function fichiers(dossier) {
	const sortie = [];
	for (const nom of readdirSync(dossier)) {
		const chemin = join(dossier, nom);
		if (statSync(chemin).isDirectory()) sortie.push(...fichiers(chemin));
		else if (/\.(ts|svelte)$/.test(nom)) sortie.push(chemin);
	}
	return sortie;
}

const problemes = [];
const signaler = (fichier, ligne, message) => problemes.push(`${relative(RACINE, fichier)}${ligne ? ':' + ligne : ''}  ${message}`);

const dossiersLib = sousDossiers(LIB).filter((n) => !EXCEPTIONS_DOSSIERS.has(n));
const outils = sousDossiers(OUTILS);

for (const d of dossiersLib) {
	if (!existsSync(join(LIB, d, 'index.ts'))) problemes.push(`src/lib/${d}/  index.ts manquant (la porte d'entrée du dossier)`);
}
for (const o of outils) {
	const index = join(OUTILS, o, 'index.ts');
	if (!existsSync(index)) {
		problemes.push(`src/outils/${o}/  index.ts manquant (doit exporter « outil »)`);
		continue;
	}
	const texte = readFileSync(index, 'utf8');
	if (!/export\s+const\s+outil\b/.test(texte)) signaler(index, 0, 'doit exporter « outil » (voir CONTRIBUTING.md)');
	const id = texte.match(/\bid:\s*'([^']+)'/)?.[1];
	if (id !== o) signaler(index, 0, `id « ${id} » différent du nom du dossier « ${o} »`);
}

const reImport = /(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"\n]+)['"]/g;

for (const fichier of fichiers(SRC)) {
	const dansLib = !relative(LIB, fichier).startsWith('..');
	const dansOutils = !relative(OUTILS, fichier).startsWith('..');
	const relLib = relative(LIB, fichier);
	const relOutil = relative(OUTILS, fichier);
	const dossierLib = dansLib ? relLib.split(sep)[0] : null;
	const nomOutil = dansOutils ? relOutil.split(sep)[0] : null;
	const estTest = /\.test\.ts$/.test(fichier);

	readFileSync(fichier, 'utf8').split('\n').forEach((texte, i) => {
		const ligne = i + 1;
		for (const m of texte.matchAll(reImport)) {
			const spec = m[1];
			let abs = null;
			if (spec.startsWith('$lib/')) abs = join(LIB, spec.slice(5));
			else if (spec.startsWith('.')) abs = resolve(dirname(fichier), spec);
			if (!abs) continue;

			// Règle 1 : porte d'entrée des dossiers du socle
			const versLib = relative(LIB, abs);
			if (!versLib.startsWith('..')) {
				const morceaux = versLib.split(sep);
				const estPorte = morceaux.length === 1 || (morceaux.length === 2 && /^index(\.ts)?$/.test(morceaux[1]));
				if (dossiersLib.includes(morceaux[0]) && morceaux[0] !== dossierLib && !estPorte)
					signaler(fichier, ligne, `import profond « ${spec} » : importer la porte d'entrée « $lib/${morceaux[0]} »`);
			}
			// Règles 2 et 3 : sens des dépendances
			const versOutil = relative(OUTILS, abs);
			if (!versOutil.startsWith('..')) {
				const cible = versOutil.split(sep)[0];
				if (dansLib) signaler(fichier, ligne, `le socle (src/lib) ne doit pas dépendre de l'outil « ${cible} »`);
				else if (dansOutils && cible !== nomOutil) signaler(fichier, ligne, `l'outil « ${nomOutil} » dépend de l'outil « ${cible} » : déplacer le code partagé dans src/lib`);
			}
		}

		// Règle 5 : constantes et types à leur place (composants et tests exemptés)
		const exempte = estTest || fichier.includes(`${sep}composants${sep}`) || fichier.includes(`${sep}components${sep}`);
		if (!exempte && (dansLib || dansOutils)) {
			const nomFichier = fichier.split(sep).at(-1);
			const c = texte.match(/^(?:export\s+)?const\s+([A-Z][A-Z0-9_]{2,})\b/);
			const okConst = dansLib ? dossierLib === 'constantes' : nomFichier === 'constantes.ts';
			if (c && !okConst) signaler(fichier, ligne, `constante ${c[1]} : à déplacer dans ${dansLib ? 'src/lib/constantes/' : 'constantes.ts de l\'outil'}`);
			const t = texte.match(/^export\s+(?:type|interface)\s+(\w+)/);
			const okType = dansLib ? dossierLib === 'types' : nomFichier === 'types.ts';
			if (t && !okType) signaler(fichier, ligne, `type ${t[1]} : à déplacer dans ${dansLib ? 'src/lib/types/' : 'types.ts de l\'outil'}`);
		}
	});
}

if (problemes.length) {
	console.error(`✗ ${problemes.length} écart(s) à l'organisation :\n` + problemes.map((p) => '  ' + p).join('\n'));
	process.exit(1);
}
console.log(`✓ Organisation respectée (socle : ${dossiersLib.join(', ')} ; outils : ${outils.join(', ') || 'aucun'})`);
