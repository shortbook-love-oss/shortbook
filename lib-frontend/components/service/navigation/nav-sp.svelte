<script lang="ts">
	import { SignIn, SignOut } from '@auth/sveltekit/components';
	import { clickoutside } from '@svelte-put/clickoutside';
	import IconHome from '~icons/mdi/home-outline';
	import IconWrite from '~icons/mdi/pencil-plus';
	import IconUser from '~icons/mdi/user-outline';
	import IconMore from '~icons/mdi/more-horiz';
	import IconSignin from '~icons/mdi/user-check-outline';
	import NavLinkSp from './nav-link-sp.svelte';
	import NavLinkSmall from './nav-link-small.svelte';
	import { page } from '$app/stores';

	// Close submenu if open
	const outsideClickThreshold = 50;
	let outsideClickTimeout = 0;
	function closeSubmenu() {
		const closeSwitch = document.getElementById('common_submenu_close') as HTMLInputElement;
		if (outsideClickTimeout === 0) {
			closeSwitch.checked = true;
		}
		// Anti-chattering measures
		outsideClickTimeout = window.setTimeout(() => {
			outsideClickTimeout = 0;
		}, outsideClickThreshold);
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
					<SignIn className="bg-primary-800 text-primary-50">
						<svelte:fragment slot="submitButton">
							<NavLinkSp name="Sign in">
								<IconSignin width="32" height="32" />
							</NavLinkSp>
						</svelte:fragment>
					</SignIn>
				</li>
			{/if}
			{#if $page.data.session?.user}
				<li>
					<button type="button" class="hover:bg-stone-200 focus:bg-stone-200">
						<label for="common_submenu_open">
							<NavLinkSp name="More">
								<IconMore width="32" height="32" />
							</NavLinkSp>
						</label>
					</button>
					<input
						type="radio"
						name="common_submenu"
						id="common_submenu_open"
						class="peer/common_submenu_open hidden"
					/>
					<ul
						id="common_submenu"
						class="absolute bottom-20 right-2 hidden rounded-xl border border-stone-400 bg-white p-2 peer-checked/common_submenu_open:block"
						use:clickoutside
						on:clickoutside={closeSubmenu}
					>
						<li>
							<SignOut className="w-fit rounded-lg hover:bg-stone-200 focus:bg-stone-200">
								<p slot="submitButton" class="px-3 py-2 text-lg text-red-800">Sign out</p>
							</SignOut>
						</li>
						<li class="mt-2 border-t border-stone-300 pt-2">
							<label>
								<NavLinkSmall name="Close menu" />
								<input
									type="radio"
									name="common_submenu"
									checked
									id="common_submenu_close"
									class="hidden"
								/>
							</label>
						</li>
					</ul>
				</li>
			{/if}
		</ul>
	</nav>
</header>
