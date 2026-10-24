// Crée un nouveau logiciel à partir du modèle scripts/modele-outil/.
// Usage : npm run nouvel-outil -- <id> "<Titre affiché>"      ex. : npm run nouvel-outil -- factures "Générateur de factures"
import { cpSync, existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const [id, ...reste] = process.argv.slice(2);
const titre = reste.join(' ').trim();

if (!id || !titre || !/^[a-z][a-z0-9-]*$/.test(id)) {
	console.error('Usage : npm run nouvel-outil -- <id> "<Titre>"\n  <id> : minuscules, chiffres et tirets, commence par une lettre (devient l\'adresse #/<id>)');
	process.exit(1);
}
const cible = join(RACINE, 'src', 'outils', id);
if (existsSync(cible)) {
	console.error(`✗ src/outils/${id} existe déjà.`);
	process.exit(1);
}

cpSync(join(RACINE, 'scripts', 'modele-outil'), cible, { recursive: true });
const remplacer = (dossier) => {
	for (const nom of readdirSync(dossier)) {
		const chemin = join(dossier, nom);
		if (statSync(chemin).isDirectory()) remplacer(chemin);
		else writeFileSync(chemin, readFileSync(chemin, 'utf8').replaceAll('__ID__', id).replaceAll('__TITRE_JSON__', JSON.stringify(titre)).replaceAll('__TITRE__', titre));
	}
};
remplacer(cible);

console.log(`✓ src/outils/${id}/ créé. Il apparaît déjà sur l'accueil (npm run dev) à l'adresse #/${id}.\n  Suite : voir src/outils/${id}/README.md et CONTRIBUTING.md`);
