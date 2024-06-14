<script>
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import Nav from '$lib/components/service/mypage/nav.svelte';
	import LayoutRule from '../_layout-rule.svelte';
</script>

<LayoutRule>
	<header slot="side">
		<a href="/" class="mb-4 mb-6 flex items-center gap-1 px-4">
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
