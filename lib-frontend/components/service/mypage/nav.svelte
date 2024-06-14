<script>
	import { SignIn } from '@auth/sveltekit/components';
	import IconArrowRight from '~icons/mdi/arrow-right-thick';
	import { page } from '$app/stores';
	import NavLinkSmall from '../navigation/nav-link-small.svelte';
	import { categories } from './menu';
</script>

<ul>
	{#if !$page.data.session?.user}
		<li class="mt-6">
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
