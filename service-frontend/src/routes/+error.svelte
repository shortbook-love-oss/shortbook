<script lang="ts">
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
	<p class="mt-16 text-center text-4xl">{$page.status}</p>
	<p class="mb-8 text-center text-xl">{$page.error?.message}</p>
	<NavLinkSmall name="Back to home" href="/" className="mx-auto w-fit">
		<IconArrowLeft width="24" height="24" class="me-1" />
	</NavLinkSmall>
</LayoutRule>
