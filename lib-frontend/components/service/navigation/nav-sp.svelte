<script lang="ts">
	import { clickoutside } from '@svelte-put/clickoutside';
	import IconHome from '~icons/mdi/home-outline';
	import IconWrite from '~icons/mdi/pencil-plus';
	import IconUser from '~icons/mdi/user-outline';
	import IconMore from '~icons/mdi/more-horiz';
	import IconSignin from '~icons/mdi/user-check-outline';
	import IconSignup from '~icons/mdi/register-outline';
	import { page } from '$app/stores';
	import { removeLangTagFromPath } from '$lib/utilities/url';
	import NavLinkSp from './nav-link-sp.svelte';
	import NavLinkSmall from './nav-link-small.svelte';
	import Signout from '$lib/components/service/auth/signout.svelte';

	// After sign-in/up redirect to
	let redirectPathname = '';
	if (['/signin', '/signup'].includes(removeLangTagFromPath($page.url.pathname))) {
		// On sign-in/up → sign-in/up page move, keep callback url;
		const callbackUrl = $page.url.searchParams.get('callbackUrl') ?? '';
		redirectPathname = encodeURIComponent(callbackUrl);
	} else {
		// On (any page) → sign-in/up page move, show the (any page) after sign-in/up
		redirectPathname = encodeURIComponent($page.url.href);
	}

	// Close submenu if open
	const outsideClickThreshold = 50;
	let outsideClickTimeout = 0;
	function closeSubmenu() {
		const closeSwitch = document.getElementById('common_submenu_close') as HTMLInputElement;
		if (outsideClickTimeout === 0) {
			closeSwitch.checked = true;
		}
		// Anti-chattering measures
		outsideClickTimeout = window.setTimeout(() => {
			outsideClickTimeout = 0;
		}, outsideClickThreshold);
	}
</script>

<header class="border-t-2 border-primary-700 bg-white">
	<nav>
		<ul class="relative flex justify-center">
			<li>
				<NavLinkSp name="Home" href="/">
					<IconHome width="32" height="32" />
				</NavLinkSp>
			</li>
			{#if $page.data.session?.user}
				<li>
					<NavLinkSp name="Write" href="/">
						<IconWrite width="32" height="32" />
					</NavLinkSp>
				</li>
				<li>
					<NavLinkSp name="Mypage" href="/mypage">
						<IconUser width="32" height="32" />
					</NavLinkSp>
				</li>
			{:else}
				<li>
					<NavLinkSp name="Sign in" href="/signin?callbackUrl={redirectPathname}">
						<IconSignin width="32" height="32" />
					</NavLinkSp>
				</li>
				<li>
					<NavLinkSp name="Sign up" href="/signup?callbackUrl={redirectPathname}">
						<IconSignup width="32" height="32" />
					</NavLinkSp>
				</li>
			{/if}
			{#if $page.data.session?.user}
				<li class="relative">
					<button type="button" class="hover:bg-stone-200 focus:bg-stone-200">
						<label for="common_submenu_open">
							<NavLinkSp name="More">
								<IconMore width="32" height="32" />
							</NavLinkSp>
						</label>
					</button>
					<input
						type="radio"
						name="common_submenu"
						id="common_submenu_open"
						class="peer/common_submenu_open hidden"
					/>
					<ul
						id="common_submenu"
						class="absolute bottom-20 right-0 hidden min-w-40 rounded-xl border border-stone-400 bg-white p-2 peer-checked/common_submenu_open:block"
						use:clickoutside
						on:clickoutside={closeSubmenu}
					>
						<li>
							<Signout dialogName="footer_signout" />
						</li>
						<li class="mt-2 border-t border-stone-300 pt-2">
							<label>
								<NavLinkSmall name="Close menu" />
								<input
									type="radio"
									name="common_submenu"
									checked
									id="common_submenu_close"
									class="hidden"
								/>
							</label>
						</li>
					</ul>
				</li>
			{/if}
		</ul>
	</nav>
</header>
