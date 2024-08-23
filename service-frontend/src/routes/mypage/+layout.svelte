<script lang="ts">
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import Overlay from '$lib/components/layouts/overlay.svelte';
	import Nav from '$lib/components/service/mypage/nav.svelte';
	import Header from '$lib/components/service/header.svelte';
	import LayoutRule from '$lib/components/service/layout-rule.svelte';
	import Meta from '$lib/components/service/meta.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<Meta />
	<meta name="robots" content="noindex" />
</svelte:head>

<LayoutRule>
	{#snippet header()}
		<div class="max-sm:hidden">
			<Header />
		</div>
		<div class="flex items-center gap-1 border-b-2 border-primary-700 bg-white sm:hidden">
			<Overlay name="mypage">
				<Nav className="px-4" />
			</Overlay>
			<p class="pe-4 text-xl">Mypage</p>
		</div>
	{/snippet}
	<div class="justify-center gap-12 sm:flex">
		<div class="shrink-0 max-sm:hidden">
			<a href="/" class="mb-6 flex items-center gap-1 gap-3">
				<IconArrowLeft width="24" height="24" class="-mx-1 shrink-0" />
				<p class="text-lg font-semibold">Back to home</p>
			</a>
			<nav class="-mx-4 px-4">
				<Nav />
			</nav>
		</div>
		<div class="mx-auto max-w-xl flex-1 sm:-mx-4 sm:overflow-x-hidden sm:px-4">
			{@render children()}
		</div>
	</div>
</LayoutRule>
