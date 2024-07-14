<script lang="ts">
	import IconHome from '~icons/mdi/home-outline';
	import IconWrite from '~icons/mdi/pencil-plus';
	import IconUser from '~icons/mdi/user-outline';
	import IconMore from '~icons/mdi/more-horiz';
	import IconSignin from '~icons/mdi/user-check-outline';
	import IconSignup from '~icons/mdi/register-outline';
	import { page } from '$app/stores';
	import * as m from '$lib/i18n/paraglide/messages.js';
	import { callbackParam, removeLangTagFromPath } from '$lib/utilities/url';
	import Dropdown from '$lib/components/layouts/dropdown.svelte';
	import Signout from '$lib/components/service/auth/signout.svelte';
	import NavLinkSp from './nav-link-sp.svelte';

	// After sign-in/up redirect to
	$: redirectPathname = (() => {
		if (['/signin', '/signup'].includes(removeLangTagFromPath($page.url.pathname))) {
			// On sign-in/up → sign-in/up page move, keep callback url;
			const callbackUrl = $page.url.searchParams.get(callbackParam) ?? '';
			return encodeURIComponent(callbackUrl);
		} else {
			// On (any page) → sign-in/up page move, show the (any page) after sign-in/up
			return encodeURIComponent($page.url.href);
		}
	})();
</script>

<header class="border-t-2 border-primary-700 bg-white">
	<nav>
		<ul class="relative flex justify-center">
			<li>
				<NavLinkSp name={m.header_home()} href="/">
					<IconHome width="32" height="32" />
				</NavLinkSp>
			</li>
			{#if $page.data.session?.user}
				<li>
					<NavLinkSp name={m.header_sp_write()} href="/write">
						<IconWrite width="32" height="32" />
					</NavLinkSp>
				</li>
				<li>
					<NavLinkSp name={m.header_mypage()} href="/mypage">
						<IconUser width="32" height="32" />
					</NavLinkSp>
				</li>
			{:else}
				<li>
					<NavLinkSp name={m.signin_label()} href="/signin?{callbackParam}={redirectPathname}">
						<IconSignin width="32" height="32" />
					</NavLinkSp>
				</li>
				<li>
					<NavLinkSp name={m.signup_label()} href="/signup?{callbackParam}={redirectPathname}">
						<IconSignup width="32" height="32" />
					</NavLinkSp>
				</li>
			{/if}
			{#if $page.data.session?.user}
				<li class="relative">
					<Dropdown name="sp_submenu" dropdownClass="bottom-20 end-[10%] min-w-40">
						<NavLinkSp slot="opener" name={m.header_more()}>
							<IconMore width="32" height="32" />
						</NavLinkSp>
						<ul>
							<li>
								<Signout dialogName="footer_signout" />
							</li>
						</ul>
					</Dropdown>
				</li>
			{/if}
		</ul>
	</nav>
</header>
