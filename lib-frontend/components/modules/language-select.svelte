<script lang="ts">
	import IconArrow from '~icons/mdi/chevron-down';
	import { page } from '$app/stores';
	import { languageTag } from '$i18n/output/runtime';
	import { languageSelect } from '$lib/utilities/language';
	import { removeLanguageTagFromPath } from '$lib/utilities/url';
	import Dropdown from '$lib/components/layouts/dropdown.svelte';
</script>

<Dropdown name="lang_select" dropdownClass="bottom-10 min-w-72">
	{#snippet opener()}
		<div class="flex items-center rounded-lg border border-stone-700 px-2 py-1">
			<p class="inline-block px-1">Change language</p>
			<IconArrow width="28" height="28" class="peer-checked/common_footer_lang_open:rotate-180" />
		</div>
	{/snippet}
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
