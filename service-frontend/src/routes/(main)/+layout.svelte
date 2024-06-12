<script>
	import Side from '$lib/components/service/side/side.svelte';
	import SideSp from '$lib/components/service/side/side-sp.svelte';
	import Footer from '$lib/components/service/footer.svelte';
</script>

<div class="flex min-h-screen flex-col">
	<div
		class="mx-auto w-full max-w-[90rem] flex-1 gap-12 px-4 pb-16 pt-12 sm:flex md:px-8 lg:gap-20"
	>
		<div class="hidden w-48 sm:block">
			<Side />
		</div>
		<div class="fixed bottom-0 left-0 w-full sm:hidden">
			<SideSp />
		</div>
		<main class="flex-1">
			<slot></slot>
		</main>
	</div>
	<Footer />
</div>
