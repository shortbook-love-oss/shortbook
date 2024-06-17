<script>
	import Header from '$lib/components/service/header.svelte';
	import LayoutRule from '../_layout-rule.svelte';
</script>

<LayoutRule>
	<div slot="header" class="hidden sm:block">
		<Header />
	</div>
	<main class="flex-1">
		<slot></slot>
	</main>
</LayoutRule>
