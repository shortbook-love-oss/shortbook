<script lang="ts">
	import LayoutRule from '$lib/components/service/layout-rule.svelte';
	import Meta from '$lib/components/service/meta.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<Meta />
</svelte:head>

<LayoutRule>
	{@render children()}
</LayoutRule>
