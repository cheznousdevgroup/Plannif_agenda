// Routage par « # » : pas de serveur à configurer, et les données d'un lien QR restent dans le fragment,
// que le navigateur n'envoie jamais au serveur.
let hash = $state(window.location.hash);
window.addEventListener('hashchange', () => (hash = window.location.hash));

export const routage = {
	get segments(): string[] {
		return hash.replace(/^#\/?/, '').split('/').filter(Boolean);
	},
};

export function naviguer(chemin: string) {
	window.location.hash = '/' + chemin;
}
