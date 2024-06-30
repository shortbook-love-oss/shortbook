<script>
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import Header from '$lib/components/service/header.svelte';
	import Nav from '$lib/components/service/mypage/nav.svelte';
	import LayoutRule from '../_layout-rule.svelte';
	import Overlay from '$lib/components/layouts/overlay.svelte';
</script>

<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<LayoutRule isNarrow={true}>
	<svelte:fragment slot="header">
		<div class="hidden sm:block">
			<Header isNarrow={true} />
		</div>
		<div class="flex items-center gap-1 border-b-2 border-primary-700 bg-white sm:hidden">
			<Overlay name="mypage">
				<Nav />
			</Overlay>
			<p class="pe-4 text-xl">Mypage</p>
		</div>
	</svelte:fragment>
	<header slot="side">
		<a href="/" class="mb-6 flex items-center gap-1 gap-3 px-4">
			<IconArrowLeft width="24" height="24" class="-mx-2" />
			<p class="text-lg font-semibold">Back to home</p>
		</a>
		<nav>
			<Nav />
		</nav>
	</header>
	<main class="w-full flex-1">
		<slot></slot>
	</main>
</LayoutRule>
