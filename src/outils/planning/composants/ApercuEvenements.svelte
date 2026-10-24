<script lang="ts">
	import type { Evenement } from '../types.ts';
	import { jourCourt, mois, plage } from '../logique/index.ts';

	let { evenements }: { evenements: Evenement[] } = $props();

	// Les événements arrivent déjà triés : un nouveau groupe commence à chaque changement de mois.
	const groupes = $derived.by(() => {
		const sortie: { mois: string; lignes: Evenement[] }[] = [];
		for (const e of evenements) {
			const m = mois(e);
			if (sortie.at(-1)?.mois !== m) sortie.push({ mois: m, lignes: [] });
			sortie.at(-1)!.lignes.push(e);
		}
		return sortie;
	});
</script>

<div class="space-y-6">
	{#each groupes as g (g.mois)}
		<section>
			<h3 class="mb-2 text-sm font-bold uppercase tracking-wider text-douce">{g.mois}</h3>
			<ul class="divide-y divide-trait overflow-hidden rounded-2xl border border-trait bg-carte">
				{#each g.lignes as e (e.debut + e.titre)}
					<li class="grid grid-cols-[4.5rem_1fr] gap-x-3 px-4 py-3 sm:grid-cols-[5rem_8rem_1fr]">
						<span class="font-semibold capitalize">{jourCourt(e)}</span>
						<span class="text-sm tabular-nums text-douce sm:self-center">{plage(e)}</span>
						<span class="col-span-2 min-w-0 sm:col-span-1">
							<span class="block font-medium">{e.titre}</span>
							{#if e.organisateur}<span class="block truncate text-sm text-douce">{e.organisateur}</span>{/if}
						</span>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
