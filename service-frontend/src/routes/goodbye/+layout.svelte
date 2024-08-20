<script lang="ts">
	import LayoutRule from '$lib/components/service/layout-rule.svelte';
	import Meta from '$lib/components/service/meta.svelte';
</script>

<svelte:head>
	<Meta />
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="contents" data-sveltekit-reload>
	<LayoutRule>
		<slot />
	</LayoutRule>
</div>
