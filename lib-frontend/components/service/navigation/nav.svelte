<script lang="ts">
	import IconWrite from '~icons/mdi/pencil-plus';
	import IconUser from '~icons/mdi/user-outline';
	import { page } from '$app/stores';
	import * as m from '$lib/i18n/paraglide/messages.js';
	import { callbackParam } from '$lib/utilities/url';
	import NavLinkSmall from './nav-link-small.svelte';
	import Signout from '$lib/components/service/auth/signout.svelte';

	// After sign-in/sign-up redirect to
	$: redirectUrl = encodeURIComponent($page.url.href);
</script>

<ul class="flex items-center">
	{#if $page.data.session?.user}
		<li>
			<NavLinkSmall name={m.header_write()} href="/write">
				<IconWrite width="20" height="20" class="-me-1" />
			</NavLinkSmall>
		</li>
		<li>
			<NavLinkSmall name={m.header_mypage()} href="/mypage">
				<IconUser width="20" height="20" class="-mx-1" />
			</NavLinkSmall>
		</li>
		<li>
			<Signout dialogName="header_signout" />
		</li>
	{:else}
		<li>
			<NavLinkSmall name={m.signin_label()} href="/signin?{callbackParam}={redirectUrl}">
				<IconUser width="20" height="20" />
			</NavLinkSmall>
		</li>
		<li>
			<NavLinkSmall name={m.signup_label()} href="/signup?{callbackParam}={redirectUrl}">
				<IconUser width="20" height="20" />
			</NavLinkSmall>
		</li>
	{/if}
</ul>
