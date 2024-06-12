<script>
	export let name = '';
	export let href = '';
</script>

{#if href}
	<a {href} class="block rounded-lg px-3 py-2 hover:bg-stone-200 focus:bg-stone-200">
		<p class="text-lg">{name}</p>
	</a>
{:else}
	<!-- use inside focusable element -->
	<div class="block rounded-lg px-3 py-2 hover:bg-stone-200 focus:bg-stone-200">
		<p class="text-lg">{name}</p>
	</div>
{/if}
