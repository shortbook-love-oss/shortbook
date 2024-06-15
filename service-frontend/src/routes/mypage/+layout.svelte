<script>
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import Header from '$lib/components/service/header.svelte';
	import Nav from '$lib/components/service/mypage/nav.svelte';
	import LayoutRule from '../_layout-rule.svelte';
	import Overlay from '$lib/components/layouts/overlay.svelte';
</script>

<LayoutRule>
	<svelte:fragment slot="header">
		<div class="hidden sm:block">
			<Header />
		</div>
		<div class="sm:hidden">
			<Overlay name="mypage">
				<p slot="title" class="text-xl">Mypage</p>
				<Nav />
			</Overlay>
		</div>
	</svelte:fragment>
	<header slot="side">
		<a href="/" class="mb-6 flex items-center gap-1 px-4">
			<IconArrowLeft width="24" height="24" class="-ml-1.5 mr-1" />
			<p class="text-lg font-semibold">Back to service</p>
		</a>
		<nav>
			<Nav />
		</nav>
	</header>
	<main>
		<slot></slot>
	</main>
</LayoutRule>
