<script lang="ts">
	import { normaliser } from '../logique/exemple.ts';

	// Reste de l'adresse après « #/__ID__ » : sert aux sous-écrans de ce logiciel (ex. « #/__ID__/detail/12 »).
	let { sousChemin }: { sousChemin: string[] } = $props();
	let texte = $state('');
</script>

<h1 class="mt-4 text-3xl font-extrabold tracking-tight">__TITRE__</h1>

<input class="mt-6 w-full rounded-xl border border-trait bg-carte px-4 py-3" bind:value={texte} aria-label="Exemple" />
<p class="mt-3 text-douce">{normaliser({ texte }).texte} {sousChemin.length ? `(${sousChemin.join('/')})` : ''}</p>
