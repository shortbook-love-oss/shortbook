<script>
	import Nav from '$lib/components/service/navigation/nav.svelte';
</script>

<header class="border-b border-stone-300 px-4">
	<div class="flex items-center justify-between gap-4 m-auto max-w-[90rem]">
		<a href="/" class="block shrink-0 rounded-md p-2 hover:bg-stone-200 focus:bg-stone-200">
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
