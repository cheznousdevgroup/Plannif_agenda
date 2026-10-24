<script lang="ts">
	import { ROUTE_RECEPTION } from '../constantes.ts';
	import { planning } from '../logique/index.ts';
	import { naviguer } from '$lib/routage';
	import ApercuEvenements from './ApercuEvenements.svelte';
	import Icone from '$lib/components/Icone.svelte';
	import ReceptionPlanning from './ReceptionPlanning.svelte';
	import ScannerQr from './ScannerQr.svelte';
	import SortieAgenda from './SortieAgenda.svelte';
	import ZoneDepot from './ZoneDepot.svelte';

	// Reste de l'adresse après « #/planning » : vide = écran principal, « recevoir/<données> » = réception d'un QR.
	let { sousChemin }: { sousChemin: string[] } = $props();
	let scan = $state(false);
</script>

{#if sousChemin[0] === ROUTE_RECEPTION}
	<ReceptionPlanning charge={sousChemin[1] ?? ''} />
{:else}
	<div class="mt-4 flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-3xl font-extrabold tracking-tight">Planning vers agenda</h1>
		<button class="bouton discret" onclick={() => (scan = true)}><Icone nom="qr" /> Scanner un QR</button>
	</div>

	<div class="mt-6 space-y-8">
		<ZoneDepot onFichiers={(f) => planning.ajouter(f)} />

		{#if planning.fichiers.length}
			<ul class="flex flex-wrap gap-2">
				{#each planning.fichiers as f (f.id)}
					<li
						class="flex items-center gap-2 rounded-full border py-1.5 pr-1.5 pl-4 text-sm
							{f.erreur ? 'border-erreur text-erreur' : 'border-trait bg-carte'}"
						title={f.erreur}
					>
						<span class="max-w-52 truncate">{f.nom}</span>
						<span class="text-douce">{f.erreur ? 'illisible' : `${f.evenements.length}${f.ignorees ? ` (+${f.ignorees} ignorés)` : ''}`}</span>
						<button class="grid size-7 place-items-center rounded-full hover:bg-trait" onclick={() => planning.retirer(f.id)} aria-label="Retirer {f.nom}">
							<Icone nom="fermer" taille={16} />
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		{#if planning.evenements.length}
			<SortieAgenda evenements={planning.evenements} />
			<ApercuEvenements evenements={planning.evenements} />
		{/if}
	</div>

	{#if scan}
		<ScannerQr
			onFermer={() => (scan = false)}
			onCharge={(charge) => {
				scan = false;
				naviguer(`planning/${ROUTE_RECEPTION}/${charge}`);
			}}
		/>
	{/if}
{/if}
