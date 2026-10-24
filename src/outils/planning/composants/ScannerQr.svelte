<script lang="ts">
	import { onMount } from 'svelte';
	import { extraireCharge } from '../logique/index.ts';
	import { demarrerScan } from '$lib/qr';
	import Icone from '$lib/components/Icone.svelte';

	let { onCharge, onFermer }: { onCharge: (charge: string) => void; onFermer: () => void } = $props();
	let video: HTMLVideoElement;
	let erreur = $state('');

	onMount(() => {
		let arreter: (() => void) | undefined;
		let ferme = false;
		let trouve = false;
		demarrerScan(video, (texte) => {
			const charge = extraireCharge(texte);
			if (charge && !trouve) {
				trouve = true;
				onCharge(charge);
			}
		}).then(
			(arret) => (ferme ? arret() : (arreter = arret)), // démontage survenu pendant l'autorisation : on coupe tout de suite
			() => (erreur = "Caméra refusée ou absente. Autorisez-la dans le navigateur, ou scannez avec l'appareil photo du téléphone."),
		);
		return () => {
			ferme = true;
			arreter?.();
		};
	});
</script>

<div class="fixed inset-0 z-50 flex flex-col bg-black/90" role="dialog" aria-modal="true" aria-label="Scanner un QR code">
	<div class="flex justify-end p-4">
		<button class="grid size-11 place-items-center rounded-full bg-white/15 text-white" onclick={onFermer} aria-label="Fermer">
			<Icone nom="fermer" />
		</button>
	</div>
	<div class="relative mx-auto flex w-full max-w-lg flex-1 items-center justify-center px-4 pb-8">
		<!-- svelte-ignore a11y_media_has_caption -->
		<video bind:this={video} playsinline muted class="max-h-full w-full rounded-2xl bg-black object-cover"></video>
		<div class="pointer-events-none absolute size-56 rounded-3xl border-4 border-accent/90"></div>
		{#if erreur}<p class="absolute inset-x-8 rounded-xl bg-carte p-4 text-center text-sm">{erreur}</p>{/if}
	</div>
</div>
