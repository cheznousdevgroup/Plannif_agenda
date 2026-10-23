<script lang="ts">
	import type { Component } from 'svelte';
	import AccueilOutils from '$lib/components/AccueilOutils.svelte';
	import EnTete from '$lib/components/EnTete.svelte';
	import OutilPlanning from '$lib/components/OutilPlanning.svelte';
	import { routage } from '$lib/routage';

	// Un logiciel = une entrée ici (clé = id du catalogue) ; il reçoit le reste de l'adresse pour ses propres sous-écrans.
	const outils: Record<string, Component<{ sousChemin: string[] }>> = { planning: OutilPlanning };

	const Outil = $derived(outils[routage.segments[0]]);
</script>

<EnTete />
<main class="mx-auto w-full max-w-4xl px-4 pb-20">
	{#if Outil}
		<Outil sousChemin={routage.segments.slice(1)} />
	{:else}
		<AccueilOutils />
	{/if}
</main>
