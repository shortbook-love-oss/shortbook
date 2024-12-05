<script lang="ts">
	import IconHome from '~icons/mdi/home-outline';
	import IconWrite from '~icons/mdi/pencil-plus';
	import IconUser from '~icons/mdi/user-outline';
	import IconMore from '~icons/mdi/more-horiz';
	import IconSignin from '~icons/mdi/user-check-outline';
	import IconSignup from '~icons/mdi/register-outline';
	import { page } from '$app/stores';
	import * as m from '$i18n/output/messages';
	import { redirectParam } from '$lib/utilities/url';
	import Dropdown from '$lib/components/layouts/dropdown.svelte';
	import Signout from '$lib/components/service/auth/signout.svelte';
	import NavLinkSp from '$lib/components/service/navigation/nav-link-sp.svelte';

	// After sign-in/up redirect to
	const redirectPathname = $derived(encodeURIComponent($page.url.href));
</script>

<header
	class="border-t-2 border-primary-700 bg-white pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
>
	<nav>
		<ul class="flex justify-center">
			<li>
				<NavLinkSp name={m.header_home()} href="/">
					<IconHome width="30" height="30" />
				</NavLinkSp>
			</li>
			{#if $page.data.signInUser}
				<li>
					<NavLinkSp name={m.header_sp_write()} href="/write">
						<IconWrite width="30" height="30" />
					</NavLinkSp>
				</li>
				<li>
					<NavLinkSp name={m.header_mypage()} href="/mypage">
						<IconUser width="30" height="30" />
					</NavLinkSp>
				</li>
			{:else}
				<li>
					<NavLinkSp name={m.signin_label()} href="/signin?{redirectParam}={redirectPathname}">
						<IconSignin width="30" height="30" />
					</NavLinkSp>
				</li>
				<li>
					<NavLinkSp name={m.signup_label()} href="/signup?{redirectParam}={redirectPathname}">
						<IconSignup width="30" height="30" />
					</NavLinkSp>
				</li>
			{/if}
			{#if $page.data.signInUser}
				<li class="relative">
					<Dropdown name="sp_submenu" dropdownClass="bottom-16 end-0 min-w-40">
						{#snippet opener()}
							<NavLinkSp name={m.header_more()}>
								<IconMore width="30" height="30" />
							</NavLinkSp>
						{/snippet}
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
