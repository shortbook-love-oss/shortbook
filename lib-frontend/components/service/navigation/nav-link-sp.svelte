<script lang="ts">
	export let name = '';
	export let href = '';
	export let className = '';
</script>

{#if href}
	<a
		{href}
		class="flex flex-col items-center px-3 pb-2 pt-1 text-stone-950 hover:bg-stone-200 focus:bg-stone-200 {className}"
	>
		{#if $$slots.default}
			<div class="shrink-0"><slot /></div>
		{/if}
		<p class="text-nowrap leading-none">{name}</p>
	</a>
{:else}
	<!-- use inside focusable element -->
	<div class="flex flex-col items-center px-3 pb-2 pt-1 {className}">
		{#if $$slots.default}
			<div class="shrink-0"><slot /></div>
		{/if}
		<p class="text-nowrap leading-none">{name}</p>
	</div>
{/if}
