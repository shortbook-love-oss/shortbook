<script>
	import { SignIn } from '@auth/sveltekit/components';
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
			<SignIn className="w-fit rounded-lg hover:bg-stone-200 focus:bg-stone-200">
				<p slot="submitButton" class="px-3 py-2 text-lg text-red-800">Sign in / Sign up</p>
			</SignIn>
		</li>
	{/if}
</ul>
