<script>
	import Footer from '$lib/components/service/footer.svelte';
</script>

<div class="flex min-h-screen flex-col">
	<main>
		<slot></slot>
	</main>
	<Footer />
</div>
