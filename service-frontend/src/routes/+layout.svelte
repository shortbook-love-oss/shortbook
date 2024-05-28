<script>
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { i18n } from '$lib/i18n';

	import '../app.css';
	import { onMount } from 'svelte';

	onMount(() => {
		const initLocale = navigator.language?.split('-')[0] || 'en';
		document.documentElement.lang = initLocale;
	});
</script>

<ParaglideJS {i18n}>
	<slot></slot>
</ParaglideJS>

<style></style>
