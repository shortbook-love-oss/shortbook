<script>
	import { SignIn, SignOut } from '@auth/sveltekit/components';
	import IconHome from '~icons/mdi/home-outline';
	import IconWrite from '~icons/mdi/pencil-plus';
	import IconUser from '~icons/mdi/user-outline';
	import IconArrowRight from '~icons/mdi/arrow-right-thick';
	import NavLink from './nav-link.svelte';
	import NavLinkSmall from './nav-link-small.svelte';
	import { page } from '$app/stores';
</script>

<ul>
	<li>
		<NavLink name="Home" href="/">
			<IconHome width="28" height="28" />
		</NavLink>
	</li>
	{#if $page.data.session?.user}
		<li>
			<NavLink name="Write" href="/">
				<IconWrite width="28" height="28" />
			</NavLink>
		</li>
		<li>
			<NavLink name="Mypage" href="/mypage">
				<IconUser width="28" height="28" />
			</NavLink>
		</li>
	{/if}
	<li>
		<NavLinkSmall name="Support" href="/" />
	</li>
	<li>
		<NavLinkSmall name="Term of use" href="/" />
	</li>
	<li>
		<NavLinkSmall name="Privacy policy" href="/" />
	</li>
	{#if $page.data.session?.user}
		<li>
			<SignOut className="w-fit rounded-lg hover:bg-stone-200 focus:bg-stone-200">
				<p slot="submitButton" class="px-3 py-2 text-lg text-red-800">Sign out</p>
			</SignOut>
		</li>
	{:else}
		<li class="mt-2">
			<SignIn className="w-fit rounded-xl hover:invert focus-within:invert bg-primary-800 min-h-64">
				<div
					slot="submitButton"
					class="px-4 py-3 text-start text-5xl leading-tight text-primary-50"
				>
					<p>Sign in and enjoy</p>
					<IconArrowRight width="64" height="64" class="ml-auto" />
				</div>
			</SignIn>
		</li>
	{/if}
</ul>
