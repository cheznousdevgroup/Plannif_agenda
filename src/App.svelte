<script lang="ts">
	import AccueilOutils from '$lib/components/AccueilOutils.svelte';
	import EnTete from '$lib/components/EnTete.svelte';
	import { catalogue } from '$lib/outils';
	import { routage } from '$lib/routage';

	const outil = $derived(catalogue.find((o) => o.id === routage.segments[0]));
</script>

<EnTete />
<main class="mx-auto w-full max-w-4xl px-4 pb-20">
	{#if outil}
		<outil.Ecran sousChemin={routage.segments.slice(1)} />
	{:else}
		<AccueilOutils />
	{/if}
</main>
