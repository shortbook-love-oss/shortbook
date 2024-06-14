<script>
	import Nav from '$lib/components/service/navigation/nav.svelte';
	import LayoutRule from '../_layout-rule.svelte';
</script>

<LayoutRule>
	<header slot="side">
		<a href="/" class="mb-4 mb-6 block px-4">
			<img
				src="/assets/shortbook-logotype.svg"
				class="m-auto mb-2 aspect-logotype w-full max-w-60"
				alt="Short book logo"
			/>
		</a>
		<nav>
			<Nav />
		</nav>
	</header>
	<main>
		<slot></slot>
	</main>
</LayoutRule>
