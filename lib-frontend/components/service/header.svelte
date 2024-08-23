<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$lib/i18n/paraglide/messages';
	import { callbackParam } from '$lib/utilities/url';
	import Dropdown from '$lib/components/layouts/dropdown.svelte';
	import Signout from '$lib/components/service/auth/signout.svelte';
	import NavLink from '$lib/components/service/navigation/nav-link.svelte';

	type Props = {
		className?: string;
	};
	let { className = '' }: Props = $props();

	// After sign-in/sign-up redirect to
	const redirectUrl = $state(encodeURIComponent($page.url.href));
</script>

<header
	class="fixed start-0 top-0 z-10 flex w-full items-center pe-[env(safe-area-inset-right,0px)] pt-[env(safe-area-inset-top,0px)] {className}"
>
	<nav
		class="flex items-center rounded-ee-lg border-b border-e border-stone-300 bg-white pl-[env(safe-area-inset-left,0px)] rtl:pr-[env(safe-area-inset-right,0px)]"
	>
		<a href="/" class="block shrink-0 p-3 hover:bg-stone-200 focus:bg-stone-200">
			<img
				src="/assets/shortbook-logotype.svg"
				class="aspect-logotype h-5 align-middle"
				alt="Short book"
			/>
		</a>
		<ul class="flex items-center">
			{#if $page.data.session?.user}
				<li>
					<NavLink name={m.header_write()} href="/write" />
				</li>
				<li>
					<NavLink name={m.header_mypage()} href="/mypage" />
				</li>
				<li class="relative">
					<Dropdown name="header_submenu" dropdownClass="top-12 min-w-40">
						{#snippet opener()}
							<NavLink name={m.header_more()} className="rounded-ee-md" />
						{/snippet}
						<ul>
							<li>
								<Signout dialogName="header_signout" />
							</li>
						</ul>
					</Dropdown>
				</li>
			{:else}
				<li>
					<NavLink name={m.signin_label()} href="/signin?{callbackParam}={redirectUrl}" />
				</li>
				<li>
					<NavLink name={m.signup_label()} href="/signup?{callbackParam}={redirectUrl}" />
				</li>
			{/if}
		</ul>
	</nav>
</header>
