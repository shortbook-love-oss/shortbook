<script lang="ts">
	import { page } from '$app/stores';
	import * as m from '$i18n/output/messages';
	import { redirectParam } from '$lib/utilities/url';
	import Dropdown from '$lib/components/layouts/dropdown.svelte';
	import Signout from '$lib/components/service/auth/signout.svelte';
	import NavLink from '$lib/components/service/navigation/nav-link.svelte';

	type Props = {
		className?: string;
	};
	let { className = '' }: Props = $props();

	// After redirect to... (also possible redirect to another domain)
	const redirectUrl = $derived.by(() => {
		const redirectTo = $page.url.searchParams.get(redirectParam);
		if ($page.data.isMypage && redirectTo) {
			return encodeURIComponent(redirectTo);
		} else {
			return encodeURIComponent($page.url.href);
		}
	});
</script>

<header class="fixed start-0 top-0 z-10 flex items-center {className}">
	<nav
		class="flex items-center rounded-ee-lg border-b border-e border-stone-300 bg-white pl-[env(safe-area-inset-left,0px)] pt-[env(safe-area-inset-top,0px)] rtl:pr-[env(safe-area-inset-right,0px)]"
	>
		<a
			href="/"
			class="block shrink-0 p-3 hover:bg-stone-200 focus:bg-stone-200"
			aria-label="Back to top page"
		>
			<img
				src="/assets/shortbook-logotype.svg"
				class="aspect-logotype h-5 align-middle"
				alt="Short book"
			/>
		</a>
		<ul class="flex items-center">
			{#if $page.data.signInUser}
				<li>
					<NavLink name={m.header_link_write()} href="/write" />
				</li>
				<li>
					<NavLink name={m.header_link_mypage()} href="/mypage?{redirectParam}={redirectUrl}" />
				</li>
				<li class="relative">
					<Dropdown
						name="header_link_submenu"
						openerClass="rounded-ee-[0.4375rem]"
						dropdownClass="top-12 min-w-40"
					>
						{#snippet opener()}
							<NavLink name={m.header_link_more()} className="rounded-ee-[0.4375rem]" />
						{/snippet}
						<ul>
							<li>
								<Signout dialogName="header_link_signout" />
							</li>
						</ul>
					</Dropdown>
				</li>
			{:else}
				<li>
					<NavLink name={m.signin_title()} href="/signin?{redirectParam}={redirectUrl}" />
				</li>
				<li>
					<NavLink name={m.signup_title()} href="/signup?{redirectParam}={redirectUrl}" />
				</li>
			{/if}
		</ul>
	</nav>
</header>
