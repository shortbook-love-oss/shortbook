<script>
	import '../app.css';
	import { onMount } from 'svelte';

	onMount(() => {
		const initLocale = navigator.language?.split('-')[0] || 'en';
		document.documentElement.lang = initLocale;
	});
</script>

<slot></slot>

<style></style>
