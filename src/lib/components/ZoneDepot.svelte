<script lang="ts">
	import Icone from './Icone.svelte';

	let { onFichiers }: { onFichiers: (fichiers: File[]) => void } = $props();
	let survol = $state(false);

	function recevoir(liste: FileList | null) {
		if (liste?.length) onFichiers([...liste]);
	}
</script>

<!-- Un <label> autour de l'<input> : clavier, lecteur d'écran et clic fonctionnent sans code supplémentaire. -->
<label
	class="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition
		{survol ? 'border-accent bg-accent/10' : 'border-trait bg-carte hover:border-douce'}"
	ondragover={(e) => {
		e.preventDefault();
		survol = true;
	}}
	ondragleave={() => (survol = false)}
	ondrop={(e) => {
		e.preventDefault();
		survol = false;
		recevoir(e.dataTransfer?.files ?? null);
	}}
>
	<span class="text-accent"><Icone nom="fichier" taille={32} /></span>
	<span class="text-lg font-semibold">Déposez vos plannings</span>
	<span class="text-sm text-douce">.csv exportés d'Outlook, un ou plusieurs</span>
	<input
		type="file"
		accept=".csv,text/csv"
		multiple
		class="sr-only"
		onchange={(e) => {
			recevoir(e.currentTarget.files);
			e.currentTarget.value = ''; // permet de redéposer le même fichier après l'avoir retiré
		}}
	/>
</label>
