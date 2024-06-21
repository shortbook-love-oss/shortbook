<script lang="ts">
	export let name: string;
	export let imageSrc = '';
	export let className: string;
</script>

<div class="flex items-center gap-3 rounded-lg {className}">
	{#if imageSrc}
		<img
			src={imageSrc}
			class="h-16 w-16 rounded-md border border-stone-400 bg-white"
			alt="Profile icon"
		/>
	{/if}
	<div>
		<p class="break-all text-xl">{name}</p>
	</div>
</div>
