<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import NavLinkSmall from '../navigation/nav-link-small.svelte';
	import { categories } from './menu';

	let isRender = true;
	onNavigate(() => {
		isRender = false;
		requestAnimationFrame(() => (isRender = true));
	});

	function isMatchPath(categorySlug: string, pageSlug: string) {
		const itemPathName = `/${categorySlug}/${pageSlug}`;
		return $page.url.pathname.endsWith(itemPathName);
	}
</script>

{#if isRender}
	<ul>
		{#each categories as category (category.href)}
			<li class="font-semibold">
				<p class="px-3 py-2 text-lg">{category.name}</p>
			</li>
			{#each category.childs as item, i (item.href)}
				<li class={category.childs.length - 1 === i ? 'mb-6' : ''}>
					<NavLinkSmall
						name={item.name}
						href="/mypage/{category.href}/{item.href}"
						className={isMatchPath(category.href, item.href) ? 'bg-primary-100' : ''}
					/>
				</li>
			{/each}
		{/each}
	</ul>
{/if}
