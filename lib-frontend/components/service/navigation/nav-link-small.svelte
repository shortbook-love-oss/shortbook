<script>
	export let name = '';
	export let href = '';
</script>

{#if href}
	<a {href} class="flex items-center rounded-lg px-3 py-2 hover:bg-stone-200 focus:bg-stone-200">
		{#if $$slots.default}
			<div class="mr-2 shrink-0"><slot></slot></div>
		{/if}
		<p class="text-lg">{name}</p>
	</a>
{:else}
	<!-- use inside focusable element -->
	<div class="flex items-center rounded-lg px-3 py-2 hover:bg-stone-200 focus:bg-stone-200">
		{#if $$slots.default}
			<div class="mr-2 shrink-0"><slot></slot></div>
		{/if}
		<p class="text-lg">{name}</p>
	</div>
{/if}
