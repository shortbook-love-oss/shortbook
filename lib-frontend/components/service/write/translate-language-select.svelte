<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import IconArrowDownThin from '~icons/mdi/arrow-down-thin';
	import IconCheck from '~icons/mdi/check-bold';
	import IconTranslate from '~icons/mdi/translate';
	import { languageSelect, type AvailableLanguageTags } from '$lib/utilities/language';
	import Dialog from '$lib/components/layouts/dialog.svelte';

	type Props = {
		sourceLanguage: Snippet;
		allCheckerName: string;
		isAllChecked: boolean;
		eachCheckerName: string;
		selectedLanguages: AvailableLanguageTags[];
		nativaLanguage: AvailableLanguageTags;
		className?: string;
	};
	let {
		sourceLanguage,
		allCheckerName = '',
		isAllChecked = $bindable(),
		eachCheckerName = '',
		selectedLanguages = $bindable(),
		nativaLanguage,
		className = ''
	}: Props = $props();

	type LanguageDecorate = {
		label: string;
		languageTag: AvailableLanguageTags;
		className: string;
	};

	let isEnableJS = $state(false);
	onMount(() => (isEnableJS = true));

	const otherLanguages = $derived(languageSelect.filter((lang) => lang.value !== nativaLanguage));
	const translateLanguages = $derived(
		otherLanguages.filter((lang) => selectedLanguages.includes(lang.value))
	);

	const languageDecorates: LanguageDecorate[] = [
		{ label: 'Spread to the world', languageTag: 'en', className: 'left-0 top-0' },
		{ label: 'نشرها للعالم', languageTag: 'ar', className: 'right-0 top-1' },
		{ label: 'दुनिया भर में फैलाना', languageTag: 'hi', className: 'left-2 top-8' },
		{ label: '世界に発信', languageTag: 'ja', className: 'right-4 top-9' }
	];
</script>

{#snippet languageDecorate({ label, languageTag, className }: LanguageDecorate)}
	<p
		lang={languageTag}
		translate="no"
		class="absolute rounded-md bg-stone-100 px-3 py-1 text-sm text-stone-500 peer-has-[:checked]:bg-primary-200 max-sm:hidden {className}"
	>
		{label}
	</p>
{/snippet}

<div class="flex flex-col items-center sm:flex-row {className}">
	<div class="flex flex-col items-end gap-4">
		{@render sourceLanguage()}
	</div>
	<div class="flex items-center sm:mt-7 sm:flex-col">
		<IconTranslate width="24" height="24" class="max-sm:-me-5 max-sm:mb-3 sm:-mb-6 sm:me-5" />
		<IconArrowDownThin width="72" height="72" class="sm:-rotate-90 sm:rtl:rotate-90" />
	</div>
	<div class="relative w-72 sm:-mt-7 sm:pt-[4.25rem]">
		<label
			class="peer relative flex items-center gap-3 rounded-xl border border-stone-700 px-4 py-2 has-[:checked]:border-primary-700 has-[:checked]:bg-primary-200"
		>
			<input
				type="checkbox"
				bind:checked={isAllChecked}
				name={allCheckerName}
				class="peer absolute left-0 top-0 z-[-1] box-border h-full w-full appearance-none rounded-xl"
			/>
			<IconCheck
				width="32"
				height="32"
				class="shrink-0 rounded border-stone-700 text-stone-200 peer-checked:bg-primary-700 peer-checked:text-stone-50 peer-[&:not(:checked)]:border"
			/>
			<div>
				<p class="text-[1.5rem] leading-tight">Translate to all</p>
				<p>{otherLanguages.length} languages</p>
			</div>
		</label>
		{#each languageDecorates as decorate (decorate.languageTag)}
			{@render languageDecorate(decorate)}
		{/each}
		<Dialog
			name="translate_lang_select"
			title="What language translate into?"
			openerClass="mt-1 mx-auto w-fit rounded-md {isAllChecked ? 'invisible' : ''}"
		>
			{#snippet opener()}
				<p class="px-3 py-1">
					Or select languages<span class:hidden={!isEnableJS} class="ml-1"
						>({translateLanguages.length})</span
					>
				</p>
			{/snippet}
			<div class="flex flex-wrap items-center gap-2">
				{#each otherLanguages as lang}
					<label class="relative inline-block">
						<input
							type="checkbox"
							name={eachCheckerName}
							value={lang.value}
							bind:group={selectedLanguages}
							class="peer absolute left-0 top-0 h-full w-full appearance-none"
						/>
						<p class="rounded-md px-3 py-2 peer-checked:bg-primary-200">{lang.english}</p>
					</label>
				{/each}
			</div>
		</Dialog>
	</div>
</div>
