<script>
	import { SignIn } from '@auth/sveltekit/components';
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import { page } from '$app/stores';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';
</script>

<svelte:head>
	<title>{$page.status} {$page.error?.message} | ShortBook</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex h-screen flex-col items-center justify-center">
	<div class="mb-8 max-w-60">
		<img
			src="/assets/shortbook-logotype.svg"
			class="aspect-logotype w-full"
			alt="Short book logo"
		/>
	</div>
	<p class="text-2xl">{$page.status}</p>
	<p class="mb-8 text-lg">{$page.error?.message}</p>
	{#if $page.status === 401}
		<SignIn
			className="w-fit rounded-lg border-2 border-primary-700 hover:bg-stone-200 focus:bg-stone-200"
		>
			<p slot="submitButton" class="px-4 py-3 text-2xl font-semibold text-red-800">
				Sign in / Sign up
			</p>
		</SignIn>
	{:else}
		<NavLinkSmall name="Back to home" href="/">
			<IconArrowLeft width="24" height="24" class="-mx-2" />
		</NavLinkSmall>
	{/if}
</div>
