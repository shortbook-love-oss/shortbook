<script lang="ts">
	import LayoutRule from '$lib/components/service/layout-rule.svelte';
	import Meta from '$lib/components/service/meta.svelte';
</script>

<svelte:head>
	<Meta />
</svelte:head>

<LayoutRule>
	<slot />
</LayoutRule>
