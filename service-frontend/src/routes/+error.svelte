<script>
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import { page } from '$app/stores';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';
	import LayoutRule from './_layout-rule.svelte';

	// After sign-in/sign-up redirect to
	let redirectUrl = encodeURIComponent($page.url.href);
</script>

<svelte:head>
	<title>{$page.status} {$page.error?.message} | ShortBook</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<LayoutRule>
	<div slot="contents" class="flex h-full min-h-96 flex-col items-center justify-center p-8">
		<p class="text-4xl">{$page.status}</p>
		<p class="mb-8 text-xl">{$page.error?.message}</p>
		{#if $page.status === 401}
			<div class="flex gap-4">
				<NavLinkSmall
					name="Sign in"
					href="/signin?callbackUrl={redirectUrl}"
					className="border-2 border-primary-700 text-2xl text-red-800"
				/>
				<NavLinkSmall
					name="Sign up"
					href="/signup?callbackUrl={redirectUrl}"
					className="border-2 border-primary-700 text-2xl text-red-800"
				/>
			</div>
		{:else}
			<NavLinkSmall name="Back to home" href="/">
				<IconArrowLeft width="24" height="24" class="me-1" />
			</NavLinkSmall>
		{/if}
	</div>
</LayoutRule>
