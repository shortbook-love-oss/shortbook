<script lang="ts">
	import { categories } from '$lib/components/service/footer/menu';
	import * as m from '$lib/i18n/paraglide/messages';
	import { languageTag } from '$lib/i18n/paraglide/runtime';
	import LanguageSelect from '$lib/components/modules/language-select.svelte';

	export let className = '';

	let yearPeriod = '2024';
	const currentYear = new Date().getFullYear();
	if (currentYear > +yearPeriod) {
		yearPeriod += '-' + currentYear;
	}
</script>

<footer
	class="flex flex-col justify-center border-t border-stone-300 bg-white pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] {className}"
>
	<nav class="flex w-full flex-wrap gap-x-16 gap-y-8 px-4 py-12 sm:mx-auto sm:w-fit sm:px-8">
		<div class="relative w-full sm:w-auto sm:pt-1.5">
			<a href="/" class="mb-2 inline-block">
				<img
					src="/assets/shortbook-logotype.svg"
					class="aspect-logotype w-48"
					alt={m.logotype_alt()}
				/>
			</a>
			<small class="mb-4 block text-base">© {yearPeriod} {m.company_name()}</small>
			<div class="relative">
				<LanguageSelect />
			</div>
		</div>
		{#each categories(languageTag()) as category (category.name)}
			<div class="text-lg">
				<h2 class="mb-3 font-bold">{category.name}</h2>
				<ul>
					{#each category.childs as item (item.href)}
						<li class="mb-3">
							<a
								href={item.href}
								target={item.href.startsWith('http') ? '_blank' : undefined}
								class="hover:underline">{item.name}</a
							>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>
</footer>
