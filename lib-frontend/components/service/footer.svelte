<script lang="ts">
	import IconArrow from '~icons/mdi/chevron-down';
	import { page } from '$app/stores';
	import { categories } from '$lib/components/service/menu';
	import * as m from '$lib/i18n/paraglide/messages';
	import { languageTag } from '$lib/i18n/paraglide/runtime';
	import { languageSelect } from '$lib/utilities/language';
	import { removeLanguageTagFromPath } from '$lib/utilities/url';
	import Dropdown from '$lib/components/layouts/dropdown.svelte';

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
			<!-- Language select -->
			<div class="relative">
				<Dropdown name="lang_select" dropdownClass="bottom-10 min-w-72">
					<div slot="opener" class="flex items-center rounded-lg border border-stone-700 px-2 py-1">
						<p class="inline-block px-1">Change language</p>
						<IconArrow
							width="28"
							height="28"
							class="peer-checked/common_footer_lang_open:rotate-180"
						/>
					</div>
					<ul class="grid grid-cols-2">
						<li class="col-span-2 mb-3 border-b border-stone-300 p-3 pb-5" aria-current="page">
							<p>Current language</p>
							<p class="text-2xl">
								{languageSelect.find((lang) => lang.value === languageTag())?.label}
							</p>
						</li>
						{#each languageSelect as lang}
							{#if lang.value !== languageTag()}
								<li class="p-3 {lang.label.length >= 12 ? 'col-span-2' : ''}">
									<a
										href={removeLanguageTagFromPath($page.url.pathname + $page.url.search)}
										hreflang={lang.value}
										class="hover:underline"
										data-sveltekit-reload
										tabindex="0">{lang.label}</a
									>
								</li>
							{/if}
						{/each}
					</ul>
				</Dropdown>
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
