<script>
	import Nav from '$lib/components/service/navigation/nav.svelte';
</script>

<header class="border-b border-stone-300 px-4 md:px-8 py-1">
	<div class="m-auto flex max-w-[90rem] justify-between gap-4">
		<a
			href="/"
			class="flex shrink-0 items-center rounded-md p-2 hover:bg-stone-200 focus:bg-stone-200"
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
