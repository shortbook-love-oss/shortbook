<script>
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import SideLinkSmall from '../side/side-link-small.svelte';
	import { categories } from './menu';
</script>

<header>
	<a href="/" class="mb-4 mb-6 block px-4">
		<img
			src="/assets/shortbook-logotype.svg"
			class="m-auto mb-2 aspect-logotype w-full max-w-60"
			alt="Short book logo"
		/>
		<div class="flex items-center gap-1">
			<IconArrowLeft width="24" height="24" class="-mx-1" />
			<p class="text-lg">Back to service</p>
		</div>
	</a>
	<nav>
		<ul>
			{#each categories as category (category.href)}
				<li class="mt-6 font-semibold">
					<p class="px-3 py-2 text-lg">{category.name}</p>
				</li>
				{#each category.childs as item (item.href)}
					<li>
						<SideLinkSmall name={item.name} href="/mypage/{category.href}/{item.href}" />
					</li>
				{/each}
			{/each}
		</ul>
	</nav>
</header>
