<script lang="ts">
	import type { Evenement } from '$lib/types';
	import { NOM_FICHIER_ICS } from '$lib/constantes';
	import { construireIcs, decoder, envoyerVersAgenda } from '$lib/planning';
	import ApercuEvenements from './ApercuEvenements.svelte';
	import Icone from './Icone.svelte';

	let { charge }: { charge: string } = $props();
	let evenements = $state<Evenement[]>([]);
	let erreur = $state('');

	$effect(() => {
		let annule = false;
		erreur = '';
		decoder(charge).then(
			(e) => !annule && (evenements = e),
			(err: Error) => !annule && ((evenements = []), (erreur = err.message)),
		);
		return () => (annule = true);
	});
</script>

<h1 class="mt-4 text-3xl font-extrabold tracking-tight">Planning reçu</h1>

{#if erreur}
	<p class="mt-6 rounded-2xl bg-erreur/10 p-5 text-erreur">{erreur}</p>
{:else if evenements.length}
	<div class="mt-6 flex items-center gap-4">
		<p class="text-douce">{evenements.length} rendez-vous</p>
		<button class="bouton ml-auto" onclick={() => envoyerVersAgenda(NOM_FICHIER_ICS, construireIcs(evenements))}>
			<Icone nom="agenda" /> Ajouter à mon agenda
		</button>
	</div>
	<div class="mt-6"><ApercuEvenements {evenements} /></div>
{/if}
