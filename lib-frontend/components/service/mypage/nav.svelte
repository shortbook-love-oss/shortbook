<script>
	import NavLinkSmall from '../navigation/nav-link-small.svelte';
	import { categories } from './menu';
</script>

<ul>
	{#each categories as category (category.href)}
		<li class="mt-6 font-semibold">
			<p class="px-3 py-2 text-lg">{category.name}</p>
		</li>
		{#each category.childs as item (item.href)}
			<li>
				<NavLinkSmall name={item.name} href="/mypage/{category.href}/{item.href}" />
			</li>
		{/each}
	{/each}
</ul>
