<script lang="ts">
	import { catalogue } from '$lib/outils';
	import Icone from './Icone.svelte';
</script>

<h1 class="mt-6 text-4xl font-extrabold tracking-tight sm:text-5xl">Petits logiciels<br /><span class="text-accent">qui rendent service.</span></h1>

<ul class="mt-10 grid gap-4 sm:grid-cols-2">
	{#each catalogue as outil (outil.id)}
		<li>
			<a
				href="#/{outil.id}"
				class="group flex h-full flex-col gap-3 rounded-2xl border border-trait bg-carte p-5 transition hover:-translate-y-0.5 hover:border-accent"
			>
				<span class="grid size-11 place-items-center rounded-xl bg-accent text-sur-accent"><Icone nom="agenda" taille={24} /></span>
				<span class="text-lg font-bold">{outil.titre}</span>
				<span class="text-sm text-douce">{outil.resume}</span>
				<span class="mt-auto text-accent transition group-hover:translate-x-1"><Icone nom="fleche" /></span>
			</a>
		</li>
	{/each}
</ul>
