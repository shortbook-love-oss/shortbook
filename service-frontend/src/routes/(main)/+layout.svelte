<script lang="ts">
	import Meta from '$lib/components/service/meta.svelte';
	import LayoutRule from '../_layout-rule.svelte';
</script>

<svelte:head>
	<Meta />
</svelte:head>

<LayoutRule>
	<slot />
</LayoutRule>
