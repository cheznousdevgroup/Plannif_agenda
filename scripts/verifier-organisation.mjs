// Vérifie l'organisation du code : « un dossier = une fonctionnalité, une seule porte d'entrée (index.ts) ».
//
// Règles contrôlées :
//   1. Entre deux dossiers de src/lib, on importe la porte d'entrée (« $lib/jeux », « ../jeux/index.ts »),
//      jamais un fichier précis du dossier (« $lib/jeux/regles »).
//   2. Chaque dossier de fonctionnalité a un index.ts.
//   3. Les constantes (NOM_EN_MAJUSCULES exporté ou non) vivent dans constantes/ ; les types exportés dans types/.
//
// Usage : node scripts/verifier-organisation.mjs   (code de sortie 1 s'il y a un problème)
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LIB = join(RACINE, 'src', 'lib');

// Dossiers qui n'ont pas à suivre la règle (bibliothèque tierce, utilitaires génériques)
const EXCEPTIONS_DOSSIERS = new Set(['components']);
const EXCEPTIONS_FICHIERS = new Set(['utils.ts']);
// Tolérées hors de constantes/ : tables calculées à partir des règles ou libellés liés à un moteur (pas des réglages)
const CONSTANTES_TOLEREES = new Set(['MOTEURS', 'NIVEAUX_GENERIQUES', 'FENETRES', 'FENETRES_PAR_CASE', 'CHIFOUMI', 'MEMORY']);

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
const signaler = (fichier, ligne, message) => problemes.push(`${relative(RACINE, fichier)}:${ligne}  ${message}`);

// Dossiers de fonctionnalités = sous-dossiers de lib (hors exceptions)
const dossiers = readdirSync(LIB).filter((n) => statSync(join(LIB, n)).isDirectory() && !EXCEPTIONS_DOSSIERS.has(n));
for (const d of dossiers) {
	if (!existsSync(join(LIB, d, 'index.ts'))) problemes.push(`src/lib/${d}/  index.ts manquant (la porte d'entrée du dossier)`);
}

const reImport = /(?:from\s+|import\s*\(\s*|import\s+)['"]([^'"\n]+)['"]/g;

for (const fichier of fichiers(join(RACINE, 'src'))) {
	const rel = relative(LIB, fichier);
	const dansLib = !rel.startsWith('..');
	const dossierFichier = dansLib ? rel.split(sep)[0] : null;
	const lignes = readFileSync(fichier, 'utf8').split('\n');

	lignes.forEach((texte, i) => {
		// ---- Règle 1 : pas d'import profond d'un autre dossier ----
		for (const m of texte.matchAll(reImport)) {
			const spec = m[1];
			let cible = null; // chemin relatif à lib, avec « / »
			if (spec.startsWith('$lib/')) cible = spec.slice(5);
			else if (spec.startsWith('.') && dansLib) cible = relative(LIB, resolve(dirname(fichier), spec)).split(sep).join('/');
			if (!cible) continue;
			const morceaux = cible.split('/');
			const dossierCible = morceaux[0];
			if (!dossiers.includes(dossierCible) || dossierCible === dossierFichier) continue;
			const estPorte = morceaux.length === 1 || (morceaux.length === 2 && /^index(\.ts)?$/.test(morceaux[1]));
			if (!estPorte) signaler(fichier, i + 1, `import profond « ${spec} » : importer la porte d'entrée « ${dossierCible} »`);
		}
		// ---- Règle 3 : constantes et types à leur place ----
		if (dansLib && dossierFichier !== 'constantes' && dossierFichier !== 'components' && !rel.includes('/ui/')) {
			const c = texte.match(/^(?:export\s+)?const\s+([A-Z][A-Z0-9_]{2,})\b/);
			if (c && !CONSTANTES_TOLEREES.has(c[1])) signaler(fichier, i + 1, `constante ${c[1]} : à déplacer dans src/lib/constantes/`);
		}
		if (dansLib && dossierFichier !== 'types' && !EXCEPTIONS_FICHIERS.has(rel) && !rel.includes('components')) {
			const t = texte.match(/^export\s+(?:type|interface)\s+(\w+)/);
			if (t) signaler(fichier, i + 1, `type ${t[1]} : à déplacer dans src/lib/types/`);
		}
	});
}

if (problemes.length) {
	console.error(`✗ ${problemes.length} écart(s) à l'organisation :\n` + problemes.map((p) => '  ' + p).join('\n'));
	process.exit(1);
}
console.log(`✓ Organisation respectée (${dossiers.length} dossiers : ${dossiers.join(', ')})`);
