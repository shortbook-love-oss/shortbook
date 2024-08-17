<script lang="ts">
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import { categories } from './menu';
	import NavLinkSmall from '$lib/components/service/navigation/nav-link-small.svelte';

	export let className = '';

	let isRender = true;
	onNavigate(() => {
		isRender = false;
		requestAnimationFrame(() => (isRender = true));
	});

	function isMatchPath(categorySlug: string, pageSlug: string) {
		return $page.url.pathname.endsWith(`/${categorySlug}/${pageSlug}`);
	}
</script>

<ul class={className}>
	{#each categories as category (category.href)}
		<li class="font-semibold [&:not(:first-child)]:mt-6">
			<p class="py-2 text-lg">{category.name}</p>
		</li>
		{#each category.childs as item (item.href)}
			{#if isRender}
				<li class="-mx-3" aria-current={isMatchPath(category.href, item.href) ? 'page' : undefined}>
					<NavLinkSmall
						name={item.name}
						href="/mypage/{category.href}/{item.href}"
						className={isMatchPath(category.href, item.href) ? 'bg-primary-200' : ''}
					/>
				</li>
			{/if}
		{/each}
	{/each}
</ul>
