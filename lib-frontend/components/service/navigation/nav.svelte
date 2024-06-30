<script>
	import IconWrite from '~icons/mdi/pencil-plus';
	import IconUser from '~icons/mdi/user-outline';
	import { page } from '$app/stores';
	import NavLinkSmall from './nav-link-small.svelte';
	import Signout from '$lib/components/service/auth/signout.svelte';

	// After sign-in/sign-up redirect to
	let redirectUrl = encodeURIComponent($page.url.href);
</script>

<ul class="flex items-center">
	{#if $page.data.session?.user}
		<li>
			<NavLinkSmall name="Write" href="/write">
				<IconWrite width="20" height="20" />
			</NavLinkSmall>
		</li>
		<li>
			<NavLinkSmall name="Mypage" href="/mypage">
				<IconUser width="20" height="20" />
			</NavLinkSmall>
		</li>
		<li>
			<Signout dialogName="header_signout" />
		</li>
	{:else}
		<li>
			<NavLinkSmall name="Sign in" href="/signin?callbackUrl={redirectUrl}">
				<IconUser width="20" height="20" />
			</NavLinkSmall>
		</li>
		<li>
			<NavLinkSmall name="Sign up" href="/signup?callbackUrl={redirectUrl}">
				<IconUser width="20" height="20" />
			</NavLinkSmall>
		</li>
	{/if}
</ul>
