<script lang="ts">
	export let name = '';
	export let href = '';
	export let colorClass = 'hover:bg-stone-200 focus:bg-stone-200';
	export let className = '';
</script>

{#if href}
	<a {href} class="flex items-center gap-2 rounded-lg px-3 py-2 text-lg {colorClass} {className}">
		{#if $$slots.default}
			<div class="shrink-0"><slot /></div>
		{/if}
		<p>{name}</p>
	</a>
{:else}
	<!-- use inside focusable element -->
	<div class="flex items-center gap-2 rounded-lg px-3 py-2 text-lg {colorClass} {className}">
		{#if $$slots.default}
			<div class="shrink-0"><slot /></div>
		{/if}
		<p>{name}</p>
	</div>
{/if}
