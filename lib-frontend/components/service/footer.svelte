<script lang="ts">
	import IconArrow from '~icons/mdi/chevron-down';
	import { page } from '$app/stores';
	import { categories } from '$lib/components/service/menu';
	import { languageTag } from '$lib/i18n/paraglide/runtime';
	import { i18n } from '$lib/i18n/i18n';
	import { languageSelect } from '$lib/utilities/language';

	let yearPeriod = '2024';
	const currentYear = new Date().getFullYear();
	if (currentYear > +yearPeriod) {
		yearPeriod += '-' + currentYear;
	}
</script>

<footer class="flex flex-col justify-center border-t border-stone-300">
	<nav
		class="m-auto flex w-full max-w-[90rem] flex-wrap gap-x-16 gap-y-8 p-4 sm:w-fit sm:px-6 md:px-8"
	>
		<div class="w-full sm:w-auto sm:pt-1">
			<a href="/" class="mb-2 block">
				<img
					src="/assets/shortbook-logotype.svg"
					class="aspect-logotype w-48"
					alt="Short book logo"
				/>
			</a>
			<small class="mb-4 block text-lg">© {yearPeriod} ShortBook LLC</small>
			<!-- Language select -->
			<label
				for="common_footer_lang_open"
				class="peer/common_footer_lang_control inline-flex items-center rounded-md border border-stone-400 px-2 py-1"
			>
				<input
					type="checkbox"
					name="common_footer_lang"
					id="common_footer_lang_open"
					class="peer/common_footer_lang_open hidden"
				/>
				<p class="inline-block px-1">Change language</p>
				<IconArrow width="28" height="28" class="peer-checked/common_footer_lang_open:rotate-180" />
			</label>
			<ul class="hidden pt-2 peer-has-[:checked]/common_footer_lang_control:block">
				{#each languageSelect as lang}
					<li class="mb-2">
						<a
							href={i18n.route($page.url.pathname)}
							hreflang={lang.value}
							class="hover:underline"
							aria-current={lang.value === languageTag() ? 'page' : undefined}>{lang.text}</a
						>
					</li>
				{/each}
			</ul>
		</div>
		{#each categories as category (category.name)}
			<div class="text-lg">
				<h2 class="mb-2 font-bold">{category.name}</h2>
				<ul>
					{#each category.childs as item (item.href)}
						<li class="mb-2">
							<a href="/{item.href}" class="hover:underline">{item.name}</a>
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</nav>
</footer>
