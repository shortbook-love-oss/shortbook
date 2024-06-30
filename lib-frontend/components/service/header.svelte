<script>
	import Nav from '$lib/components/service/navigation/nav.svelte';

	export let isNarrow = false;
</script>

<header class="border-b border-stone-300">
	<div
		class="m-auto flex w-full justify-between gap-4 px-4 py-1 md:px-6 {isNarrow
			? 'max-w-screen-lg'
			: 'max-w-screen-2xl'}"
	>
		<a
			href="/"
			class="flex shrink-0 items-center rounded-md px-3 py-2 hover:bg-stone-200 focus:bg-stone-200"
		>
			<img
				src="/assets/shortbook-logotype.svg"
				class="aspect-logotype w-full max-w-36"
				alt="Short book logo"
			/>
		</a>
		<nav>
			<Nav />
		</nav>
	</div>
</header>
