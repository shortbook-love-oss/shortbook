<script>
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n/i18n';
	import Side from '$lib/components/service/side.svelte';
	import Footer from '$lib/components/service/footer.svelte';

	import '../app.css';
</script>

<ParaglideJS {i18n}>
	<div class="flex min-h-screen flex-col px-4 pt-12 md:px-8">
		<div class="mx-auto mb-16 w-full max-w-[90rem] flex-1 gap-12 sm:flex lg:gap-20">
			<div class="w-48">
				<Side />
			</div>
			<main class="flex-1">
				<slot></slot>
			</main>
		</div>
		<Footer />
	</div>
</ParaglideJS>
