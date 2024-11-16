<script lang="ts">
	import IconArrow from '~icons/mdi/chevron-down';
	import { page } from '$app/stores';
	import { languageTag } from '$i18n/output/runtime';
	import { languageSelect } from '$lib/utilities/language';
	import { removeLanguageTagFromPath } from '$lib/utilities/url';
	import Dialog from '$lib/components/layouts/dialog.svelte';
</script>

<Dialog name="lang_select" title="Change language" openerClass="w-fit" dialogSizeClass="max-w-xl">
	{#snippet opener()}
		<div class="flex items-center rounded-lg border border-stone-700 px-2 py-1">
			<p class="inline-block px-1">Change language</p>
			<IconArrow width="28" height="28" class="peer-checked/common_footer_lang_open:rotate-180" />
		</div>
	{/snippet}
	<div class="mb-3 border-b border-stone-300 pb-4 xs:px-3">
		<p>Current language</p>
		<p class="text-2xl" aria-current="page">
			{languageSelect.find((lang) => lang.value === languageTag())?.label}
		</p>
	</div>
	<ul class="grid grid-cols-2 gap-x-3 gap-y-4 py-2 xs:px-3">
		{#each languageSelect as lang}
			{#if lang.value !== languageTag()}
				<li class={lang.label.length >= 14 ? 'max-sm:col-span-2' : ''}>
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
</Dialog>
