<script>
	import IconWrite from '~icons/mdi/pencil-plus';
	import IconUser from '~icons/mdi/user-outline';
	import NavLinkSmall from './nav-link-small.svelte';
	import Signout from '$lib/components/service/auth/signout.svelte';
	import { page } from '$app/stores';
</script>

<ul class="flex items-center">
	{#if $page.data.session?.user}
		<li>
			<NavLinkSmall name="Write" href="/">
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
			<NavLinkSmall name="Sign in" href="/signin">
				<IconUser width="20" height="20" />
			</NavLinkSmall>
		</li>
		<li>
			<NavLinkSmall name="Sign up" href="/signup">
				<IconUser width="20" height="20" />
			</NavLinkSmall>
		</li>
	{/if}
</ul>
