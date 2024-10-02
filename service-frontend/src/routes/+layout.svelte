<script lang="ts">
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { page, updated } from '$app/stores';
	import { i18n } from '$i18n/init';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="manifest" href="{$page.url.origin}/manifest.json" />
	<meta name="theme-color" content="#ffffff" />
	<!-- The Common Crawl dataset. Used by GPT-xxx and available for others. -->
	<meta name="CCBot" content="nofollow" />
	<!-- Used by DeviantArt, ArtStation, etc. based on opt-in or opt-out -->
	<meta name="robots" content="noai, noimageai" />
	<!-- TDM Metadata in HTML Content -->
	<meta name="tdm-reservation" content="1" />
</svelte:head>

<ParaglideJS {i18n}>
	<div class="contents" data-sveltekit-reload={$updated}>
		{@render children()}
	</div>
</ParaglideJS>
