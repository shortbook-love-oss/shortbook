<script>
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import { page, updated } from '$app/stores';
	import { i18n } from '$lib/i18n/i18n';
	import '../app.css';
</script>

<svelte:head>
	<link rel="icon" href="{$page.url.origin}/favicon.ico" />
	<link rel="apple-touch-icon" sizes="180x180" href="{$page.url.origin}/apple-touch-icon.png" />
	<link rel="icon" type="image/png" sizes="32x32" href="{$page.url.origin}/favicon-32x32.png" />
	<link rel="icon" type="image/png" sizes="16x16" href="{$page.url.origin}/favicon-16x16.png" />
	<link rel="manifest" href="{$page.url.origin}/site.webmanifest" />
	<link rel="mask-icon" href="{$page.url.origin}/safari-pinned-tab.svg" color="#a65351" />
	<meta name="apple-mobile-web-app-title" content="ShortBook" />
	<meta name="application-name" content="ShortBook" />
	<meta name="msapplication-TileColor" content="#fcf1d1" />
	<meta name="theme-color" content="#ffffff" />
</svelte:head>

<ParaglideJS {i18n}>
	<div class="contents" data-sveltekit-reload={$updated}>
		<slot />
	</div>
</ParaglideJS>
