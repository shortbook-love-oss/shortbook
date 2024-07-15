<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$lib/i18n/paraglide/messages';
	import { callbackParam } from '$lib/utilities/url';
	import Signout from '$lib/components/service/auth/signout.svelte';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';

	export let className = '';

	// After sign-in/sign-up redirect to
	$: redirectUrl = encodeURIComponent($page.url.href);
</script>

<header
	class="fixed start-0 top-0 z-10 flex w-full items-center pe-[env(safe-area-inset-right,0px)] pt-[env(safe-area-inset-top,0px)] {className}"
>
	<nav
		class="flex items-center rounded-ee-lg border-b border-e border-stone-300 bg-white py-1 pe-1 pl-[env(safe-area-inset-left,0px)] rtl:pr-[env(safe-area-inset-right,0px)]"
	>
		<a
			href="/"
			class="ms-1 block shrink-0 items-center rounded-md p-2 hover:bg-stone-200 focus:bg-stone-200"
		>
			<img src="/assets/shortbook-logo.svg" class="h-7 w-7 align-middle" alt="Short book" />
		</a>
		<ul class="flex items-center">
			{#if $page.data.session?.user}
				<li>
					<NavLinkSmall name={m.header_write()} href="/write" />
				</li>
				<li>
					<NavLinkSmall name={m.header_mypage()} href="/mypage" />
				</li>
				<li>
					<Signout dialogName="header_signout" />
				</li>
			{:else}
				<li>
					<NavLinkSmall name={m.signin_label()} href="/signin?{callbackParam}={redirectUrl}" />
				</li>
				<li>
					<NavLinkSmall name={m.signup_label()} href="/signup?{callbackParam}={redirectUrl}" />
				</li>
			{/if}
		</ul>
	</nav>
</header>
