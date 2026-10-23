<script lang="ts">
	// Icônes en trait, une seule source : on ajoute un dessin dans `formes`, on l'appelle par son nom.
	const formes = {
		agenda: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
		qr: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z',
		fichier: 'M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zM14 3v5h5',
		fermer: 'M6 6l12 12M18 6L6 18',
		telecharger: 'M12 4v11M7 11l5 5 5-5M5 20h14',
		fleche: 'M5 12h14M13 6l6 6-6 6',
	} as const;

	let { nom, taille = 20 }: { nom: keyof typeof formes; taille?: number } = $props();
</script>

<svg width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	<path d={formes[nom]} />
</svg>
