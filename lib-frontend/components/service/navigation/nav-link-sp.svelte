<script>
	export let name = '';
	export let href = '';
</script>

{#if href}
	<a
		{href}
		class="flex flex-col items-center rounded-md px-3 py-2 text-stone-950 hover:bg-stone-200 focus:bg-stone-200"
	>
		<div><slot></slot></div>
		<p class="text-center">{name}</p>
	</a>
{:else}
	<!-- use inside focusable element -->
	<div class="flex flex-col items-center px-3 py-2">
		<div><slot></slot></div>
		<p>{name}</p>
	</div>
{/if}
