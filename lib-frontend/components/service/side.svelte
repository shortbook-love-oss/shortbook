<script>
	import { SignIn, SignOut } from '@auth/sveltekit/components';
	import IconHome from '~icons/mdi/home-outline';
	import IconSearch from '~icons/mdi/search';
	import IconSetting from '~icons/mdi/settings-outline';
	import IconUser from '~icons/mdi/user';
	import IconArrowRight from '~icons/mdi/arrow-right-thick';
	import SideLink from './side-link.svelte';
	import SideLinkSmall from './side-link-small.svelte';
	import { page } from '$app/stores';
</script>

<header>
	<div class="mb-4 mb-6 px-4">
		<img
			src="/assets/shortbook-logotype.svg"
			class="m-auto mb-2 aspect-logotype w-full max-w-60"
			alt="Short book logo"
		/>
	</div>
	<nav>
		<ul class="relative">
			<li>
				<SideLink name="Home" href="/">
					<IconHome width="28" height="28" />
				</SideLink>
			</li>
			<li>
				<SideLink name="Search" href="/">
					<IconSearch width="28" height="28" />
				</SideLink>
			</li>
			<li>
				<SideLink name="Setting" href="/mypage">
					<IconSetting width="28" height="28" />
				</SideLink>
			</li>
			{#if $page.data.session?.user}
				<li>
					<SideLink name={$page.data.session.user.name ?? 'User'} href="/">
						<IconUser width="28" height="28" />
					</SideLink>
				</li>
			{/if}
			<li>
				<SideLinkSmall name="Support" href="/" />
			</li>
			<li>
				<SideLinkSmall name="Term of use" href="/" />
			</li>
			<li>
				<SideLinkSmall name="Privacy policy" href="/" />
			</li>
			{#if $page.data.session?.user}
				<li>
					<SignOut className="w-fit rounded-lg hover:bg-stone-200 focus:bg-stone-200">
						<div slot="submitButton" class="px-3 py-2">Sign out</div>
					</SignOut>
				</li>
			{:else}
				<li class="mt-2">
					<SignIn
						className="w-fit rounded-xl hover:invert focus-within:invert bg-primary-800 min-h-64"
					>
						<div
							slot="submitButton"
							class="px-4 py-3 text-start text-5xl leading-tight text-primary-50"
						>
							<h2>Sign in and enjoy</h2>
							<IconArrowRight width="64" height="64" class="ml-auto" />
						</div>
					</SignIn>
				</li>
			{/if}
		</ul>
	</nav>
</header>
