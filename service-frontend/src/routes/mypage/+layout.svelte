<script lang="ts">
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import Overlay from '$lib/components/layouts/overlay.svelte';
	import Header from '$lib/components/service/header.svelte';
	import Meta from '$lib/components/service/meta.svelte';
	import Nav from '$lib/components/service/mypage/nav.svelte';
	import LayoutRule from '../_layout-rule.svelte';
</script>

<svelte:head>
	<Meta />
	<meta name="robots" content="noindex" />
</svelte:head>

<LayoutRule>
	<svelte:fragment slot="header">
		<div class="max-sm:hidden">
			<Header />
		</div>
		<div class="flex items-center gap-1 border-b-2 border-primary-700 bg-white sm:hidden">
			<Overlay name="mypage">
				<Nav />
			</Overlay>
			<p class="pe-4 text-xl">Mypage</p>
		</div>
	</svelte:fragment>
	<div class="justify-center gap-12 sm:flex">
		<div class="max-sm:hidden">
			<a href="/" class="mb-6 flex items-center gap-1 gap-3 px-4">
				<IconArrowLeft width="24" height="24" class="-mx-2" />
				<p class="text-lg font-semibold">Back to home</p>
			</a>
			<nav>
				<Nav />
			</nav>
		</div>
		<div class="max-w-xl flex-1">
			<slot />
		</div>
	</div>
</LayoutRule>
