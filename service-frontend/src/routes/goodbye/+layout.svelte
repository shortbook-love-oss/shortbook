<script lang="ts">
	import Meta from '$lib/components/service/meta.svelte';
	import LayoutRule from '../_layout-rule.svelte';
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
