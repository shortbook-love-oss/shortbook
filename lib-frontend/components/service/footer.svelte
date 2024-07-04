<script lang="ts">
	import IconArrow from '~icons/mdi/chevron-down';
	import { page } from '$app/stores';
	import { categories } from '$lib/components/service/menu';
	import { languageTag } from '$lib/i18n/paraglide/runtime';
	import { i18n } from '$lib/i18n/i18n';
	import { languageSelect } from '$lib/utilities/language';
	import Dropdown from '$lib/components/layouts/dropdown.svelte';

	let yearPeriod = '2024';
	const currentYear = new Date().getFullYear();
	if (currentYear > +yearPeriod) {
		yearPeriod += '-' + currentYear;
	}
</script>

<footer class="flex flex-col justify-center border-t border-stone-300">
	<nav
		class="m-auto flex w-full flex-wrap gap-x-16 gap-y-8 px-4 pb-16 pt-12 sm:w-fit sm:px-6 md:px-8"
	>
		<div class="relative w-full sm:w-auto sm:pt-1.5">
			<a href="/" class="mb-2 inline-block">
				<img
					src="/assets/shortbook-logotype.svg"
					class="aspect-logotype w-48"
					alt="Short book logo"
				/>
			</a>
			<small class="mb-4 block text-base">© {yearPeriod} ShortBook LLC</small>
			<!-- Language select -->
			<Dropdown name="lang_select" dropdownClass="bottom-2 min-w-40">
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
							{languageSelect.find((lang) => lang.value === languageTag())?.text}
						</p>
					</li>
					{#each languageSelect as lang}
						{#if lang.value !== languageTag()}
							<li class="p-3 {lang.text.length >= 12 ? 'col-span-2' : ''}">
								<a
									href={i18n.route($page.url.pathname)}
									hreflang={lang.value}
									class="hover:underline"
									tabindex="0">{lang.text}</a
								>
							</li>
						{/if}
					{/each}
				</ul>
			</Dropdown>
		</div>
		{#each categories as category (category.name)}
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
