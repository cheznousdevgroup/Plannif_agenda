<script lang="ts">
	import type { Evenement } from '../types.ts';
	import { NOM_FICHIER_ICS } from '../constantes.ts';
	import { construireIcs, envoyerVersAgenda, liensPourQr } from '../logique/index.ts';
	import { dessinerQr } from '$lib/qr';
	import Icone from '$lib/components/Icone.svelte';

	let { evenements }: { evenements: Evenement[] } = $props();
	let images = $state<string[]>([]);

	// Un téléphone ne peut pas ouvrir un lien « localhost » : on prévient plutôt que de laisser un QR qui ne mène nulle part.
	const adresseLocale = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);

	$effect(() => {
		const lot = evenements;
		let annule = false;
		liensPourQr(lot)
			.then((liens) => Promise.all(liens.map(dessinerQr)))
			.then((i) => !annule && (images = i))
			.catch(() => !annule && (images = []));
		return () => (annule = true);
	});
</script>

<div class="grid gap-4 sm:grid-cols-2">
	<section class="flex flex-col gap-3 rounded-2xl border border-trait bg-carte p-5">
		<h2 class="text-lg font-bold">Calendrier Outlook</h2>
		<p class="text-sm text-douce">Ouvrez le fichier : Outlook ajoute les {evenements.length} rendez-vous. Le réimporter ne crée pas de doublons.</p>
		<button class="bouton mt-auto" onclick={() => envoyerVersAgenda(NOM_FICHIER_ICS, construireIcs(evenements))}>
			<Icone nom="telecharger" /> Télécharger le .ics
		</button>
	</section>

	<section class="flex flex-col gap-3 rounded-2xl border border-trait bg-carte p-5">
		<h2 class="flex items-center gap-2 text-lg font-bold"><Icone nom="qr" /> QR code{images.length > 1 ? 's' : ''}</h2>
		{#if adresseLocale}
			<p class="rounded-lg bg-erreur/10 px-3 py-2 text-sm text-erreur">
				Ce QR pointe vers « {location.hostname} » : ouvrez l'app via l'adresse réseau (ex. http://192.168.x.x:5173) pour qu'un téléphone puisse le lire.
			</p>
		{/if}
		<div class="grid gap-3 {images.length > 1 ? 'grid-cols-2' : ''}">
			{#each images as src, i (i)}
				<figure class="text-center">
					<img {src} alt="QR code {i + 1} sur {images.length}" class="mx-auto w-full max-w-[22rem] rounded-xl bg-white p-1" />
					{#if images.length > 1}<figcaption class="mt-1 text-sm text-douce">{i + 1} / {images.length}</figcaption>{/if}
				</figure>
			{/each}
		</div>
	</section>
</div>
