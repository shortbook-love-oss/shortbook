<script>
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import { page } from '$app/stores';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';
	import LayoutRule from './_layout-rule.svelte';
</script>

<svelte:head>
	<title>{$page.status} {$page.error?.message} | ShortBook</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<LayoutRule>
	<div slot="contents" class="flex h-full min-h-80 flex-col items-center justify-center p-8">
		<p class="text-4xl">{$page.status}</p>
		<p class="mb-8 text-xl">{$page.error?.message}</p>
		<NavLinkSmall name="Back to home" href="/">
			<IconArrowLeft width="24" height="24" class="me-1" />
		</NavLinkSmall>
	</div>
</LayoutRule>
