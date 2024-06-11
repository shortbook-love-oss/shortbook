<script>
	import IconHome from '~icons/mdi/home-outline';
	import IconSearch from '~icons/mdi/search';
	import IconSetting from '~icons/mdi/settings-outline';
	import IconSupport from '~icons/mdi/help-circle-outline';
	import IconUser from '~icons/mdi/user';
	import SideLink from './side-link.svelte';
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
		<ul>
			<li>
				<SideLink name="Home" href="/"><IconHome width="28" height="28" /></SideLink>
			</li>
			<li>
				<SideLink name="Search" href="/"><IconSearch width="28" height="28" /></SideLink>
			</li>
			<li>
				<SideLink name="Setting" href="/mypage"><IconSetting width="28" height="28" /></SideLink>
			</li>
			<li>
				<SideLink name="Support" href="/"><IconSupport width="28" height="28" /></SideLink>
			</li>
			<li>
				<SideLink name="Profile" href="/"><IconUser width="28" height="28" /></SideLink>
			</li>
		</ul>
	</nav>
</header>
