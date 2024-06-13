<script>
	import { SignIn, SignOut } from '@auth/sveltekit/components';
	import IconHome from '~icons/mdi/home-outline';
	import IconSetting from '~icons/mdi/settings-outline';
	import IconUser from '~icons/mdi/user';
	import IconMore from '~icons/mdi/more-horiz';
	import IconSignin from '~icons/mdi/user-check-outline';
	import NavLinkSp from './nav-link-sp.svelte';
	import NavLinkSmall from './nav-link-small.svelte';
	import { page } from '$app/stores';
</script>

<header class="border-t-2 border-primary-700 bg-white">
	<nav>
		<ul class="relative flex justify-center">
			<li>
				<NavLinkSp name="Home" href="/">
					<IconHome width="28" height="28" />
				</NavLinkSp>
			</li>
			{#if $page.data.session?.user}
				<li>
					<NavLinkSp name="Profile" href="/">
						<IconUser width="28" height="28" />
					</NavLinkSp>
				</li>
			{:else}
				<li>
					<SignIn className="bg-primary-800 text-primary-50">
						<svelte:fragment slot="submitButton">
							<NavLinkSp name="Sign in">
								<IconSignin width="28" height="28" />
							</NavLinkSp>
						</svelte:fragment>
					</SignIn>
				</li>
			{/if}
			<li>
				<NavLinkSp name="Setting" href="/mypage">
					<IconSetting width="28" height="28" />
				</NavLinkSp>
			</li>
			<li>
				<button type="button" class="hover:bg-stone-200 focus:bg-stone-200">
					<label for="common_submenu_open">
						<NavLinkSp name="More">
							<IconMore width="28" height="28" />
						</NavLinkSp>
					</label>
				</button>
				<input type="radio" name="menu_more" id="common_submenu_open" class="hidden" />
				<ul
					id="common_submenu"
					class="absolute bottom-20 right-2 rounded-xl border border-stone-400 bg-white p-2"
				>
					{#if $page.data.session?.user}
						<li>
							<SignOut className="w-fit rounded-lg hover:bg-stone-200 focus:bg-stone-200">
								<p slot="submitButton" class="px-3 py-2 text-lg text-red-800">Sign out</p>
							</SignOut>
						</li>
					{/if}
					<li>
						<NavLinkSmall name="Term of use" href="/" />
					</li>
					<li>
						<NavLinkSmall name="Privacy policy" href="/" />
					</li>
					<li>
						<NavLinkSmall name="Support" href="/" />
					</li>
					<li class="mt-2 border-t border-stone-300 pt-2">
						<label>
							<NavLinkSmall name="Close menu" />
							<input type="radio" name="menu_more" id="common_submenu_close" class="hidden" />
						</label>
					</li>
				</ul>
			</li>
		</ul>
	</nav>
</header>

<style lang="postcss">
	#common_submenu_open:not(:checked) ~ #common_submenu {
		display: none;
	}
</style>
