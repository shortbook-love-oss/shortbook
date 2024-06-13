<script>
	import { SignIn, SignOut } from '@auth/sveltekit/components';
	import IconHome from '~icons/mdi/home-outline';
	import IconSetting from '~icons/mdi/settings-outline';
	import IconUser from '~icons/mdi/user';
	import IconMore from '~icons/mdi/more-horiz';
	import IconSignin from '~icons/mdi/user-check-outline';
	import SideLinkSp from './side-link-sp.svelte';
	import SideLinkSmall from './side-link-small.svelte';
	import { page } from '$app/stores';
</script>

<header class="border-t-2 border-primary-700 bg-white">
	<nav>
		<ul class="relative flex justify-center">
			<li>
				<SideLinkSp name="Home" href="/">
					<IconHome width="28" height="28" />
				</SideLinkSp>
			</li>
			{#if $page.data.session?.user}
				<li>
					<SideLinkSp name="Profile" href="/">
						<IconUser width="28" height="28" />
					</SideLinkSp>
				</li>
			{:else}
				<li>
					<SignIn className="bg-primary-800 text-primary-50">
						<svelte:fragment slot="submitButton">
							<SideLinkSp name="Sign in">
								<IconSignin width="28" height="28" />
							</SideLinkSp>
						</svelte:fragment>
					</SignIn>
				</li>
			{/if}
			<li>
				<SideLinkSp name="Setting" href="/mypage">
					<IconSetting width="28" height="28" />
				</SideLinkSp>
			</li>
			<li>
				<button type="button" class="hover:bg-stone-200 focus:bg-stone-200">
					<label for="common_submenu_open">
						<SideLinkSp name="More">
							<IconMore width="28" height="28" />
						</SideLinkSp>
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
						<SideLinkSmall name="Term of use" href="/" />
					</li>
					<li>
						<SideLinkSmall name="Privacy policy" href="/" />
					</li>
					<li>
						<SideLinkSmall name="Support" href="/" />
					</li>
					<li class="mt-2 border-t border-stone-300 pt-2">
						<label>
							<SideLinkSmall name="Close menu" />
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
