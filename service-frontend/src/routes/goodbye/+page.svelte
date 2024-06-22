<script>
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import { page } from '$app/stores';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';
	import { getLangTagPathPart } from '$lib/utilities/url';
	import LayoutRule from '../_layout-rule.svelte';
</script>

<svelte:head>
	<title>Thank you for using | ShortBook</title>
	<meta http-equiv="refresh" content="5; url={getLangTagPathPart($page.url.pathname)}" />
	<meta name="robots" content="noindex" />
</svelte:head>

<LayoutRule>
	<div slot="contents" class="flex h-full min-h-96 flex-col items-center justify-center p-8">
		<p class="mb-2 text-center text-2xl">Thank you for using.</p>
		<p class="mb-12 text-center text-2xl">Good bye.</p>
		<p class="mb-2">Will be redirect to home in 5 seconds.</p>
		<NavLinkSmall name="Back to home" href="/">
			<IconArrowLeft width="24" height="24" class="-mx-1" />
		</NavLinkSmall>
	</div>
</LayoutRule>
