<script lang="ts">
	import IconHome from '~icons/mdi/home-outline';
	import IconWrite from '~icons/mdi/pencil-plus';
	import IconUser from '~icons/mdi/user-outline';
	import IconMore from '~icons/mdi/more-horiz';
	import IconSignin from '~icons/mdi/user-check-outline';
	import IconSignup from '~icons/mdi/register-outline';
	import { page } from '$app/stores';
	import { removeLangTagFromPath } from '$lib/utilities/url';
	import Dropdown from '$lib/components/layouts/dropdown.svelte';
	import Signout from '$lib/components/service/auth/signout.svelte';
	import NavLinkSp from './nav-link-sp.svelte';

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
					<Dropdown name="sp_submenu" dropdownClass="bottom-20 end-[10%] min-w-40">
						<NavLinkSp slot="opener" name="More">
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
