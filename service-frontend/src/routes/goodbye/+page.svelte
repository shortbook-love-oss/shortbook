<script lang="ts">
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import { page } from '$app/stores';
	import { setLanguageTagToPath } from '$lib/utilities/url';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';
</script>

<svelte:head>
	<title>Thank you for using | ShortBook</title>
	<meta http-equiv="refresh" content="5; url={setLanguageTagToPath('/', $page.url)}" />
</svelte:head>

<p class="mb-2 mt-16 text-center text-2xl">Thank you for using.</p>
<p class="mb-12 text-center text-2xl">Good bye.</p>
<p class="mb-2 text-center">Will be redirect to home in 5 seconds.</p>
<NavLinkSmall name="Back to home" href="/" className="mx-auto w-fit">
	<IconArrowLeft width="24" height="24" class="me-1" />
</NavLinkSmall>
