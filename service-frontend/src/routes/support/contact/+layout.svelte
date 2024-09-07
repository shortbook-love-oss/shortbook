<script lang="ts">
	import LayoutRule from '$lib/components/service/layout-rule.svelte';
	import Meta from '$lib/components/service/meta.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<Meta />
</svelte:head>

<LayoutRule>
	{#snippet header()}
		<div class="flex justify-center border-b border-stone-300 px-8 py-1">
			<a href="/" class="rounded-md px-3 py-2 hover:bg-stone-200 focus:bg-stone-200">
				<img
					src="/assets/shortbook-logotype.svg"
					class="aspect-logotype w-48"
					alt="Short book logo"
				/>
			</a>
		</div>
	{/snippet}
	{@render children()}
</LayoutRule>
