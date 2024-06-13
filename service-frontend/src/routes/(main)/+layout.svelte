<script>
	import NavSp from '$lib/components/service/navigation/nav-sp.svelte';
	import Footer from '$lib/components/service/footer.svelte';
</script>

<div class="flex min-h-screen flex-col">
	<div
		class="mx-auto w-full max-w-[90rem] flex-1 gap-12 px-4 pb-16 pt-12 sm:flex md:px-8 lg:gap-20"
	>
		<slot></slot>
	</div>
	<div class="fixed bottom-0 left-0 w-full sm:hidden">
		<NavSp />
	</div>
	<Footer />
</div>
