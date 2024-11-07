<script lang="ts">
	import IconArrowLeft from '~icons/mdi/arrow-left';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { BookDraftUpdateResult } from '$lib/utilities/book';
	import { toLocaleDatetime } from '$lib/utilities/date';
	import { getLanguageTagFromUrl } from '$lib/utilities/url';
	import { validateOnlyVisibleChar } from '$lib/validation/rules/string';
	import HeaderArea from '$lib/components/layouts/header-area.svelte';
	import TextAreaSingle from '$lib/components/modules/form/text-area-single.svelte';
	import Editor from '$lib/components/modules/wysiwyg-editor/editor.svelte';
	import LayoutRule from '$lib/components/service/layout-rule.svelte';
	import Meta from '$lib/components/service/meta.svelte';

	let { data } = $props();

	const requestLang = getLanguageTagFromUrl($page.url);

	let bookId = $state(data.bookId);
	let bookStatus = $state(data.bookStatus);
	let title = $state(data.form.data.title);
	let subtitle = $state(data.form.data.subtitle);
	let prologue = $state(data.prologue);
	let content = $state(data.content);

	const hasPublishedRevision = data.hasPublishedRevision;
	const isValidTitle = $derived(title && validateOnlyVisibleChar(title));
	let initTitle = $state(data.initTitle);
	let isAutoSaved = $state(false);

	const savedLabel = $derived.by(() => {
		const datetime = toLocaleDatetime(data.updatedAt, requestLang);
		if (data.updatedAt) {
			if (isAutoSaved) {
				return `Auto saved at ${datetime}`;
			} else {
				return `Last edited at ${datetime}`;
			}
		} else {
			return undefined;
		}
	});

	let autoSaveTimeout = $state(0);
	function autoSave() {
		window.clearTimeout(autoSaveTimeout);
		autoSaveTimeout = window.setTimeout(async () => {
			autoSaveTimeout = 0;
			await save();
			bookStatus = 0;
		}, 3000);
	}

	async function finish() {
		if (autoSaveTimeout !== 0) {
			await save();
		}
		if (bookId) {
			goto(`/write/${bookId}/publish`);
		}
	}

	async function save() {
		return await fetch('/api/book/draft', {
			method: bookId ? 'PUT' : 'POST',
			body: JSON.stringify({
				title,
				subtitle,
				prologue,
				content,
				bookId
			})
		})
			.then(async (res) => {
				const result = (await res.json()) as BookDraftUpdateResult;
				isAutoSaved = true;
				initTitle = title;
				bookId = result.bookId;
				window.setTimeout(() => {
					isAutoSaved = false;
				}, 2000);
				return result;
			})
			.catch((e: Error) => e);
	}
</script>

<svelte:head>
	{#if data.bookId}
		<title>Write new book | ShortBook</title>
	{:else}
		<title>Edit "{initTitle}" | ShortBook</title>
	{/if}
	<Meta />
	<meta name="robots" content="noindex" />
</svelte:head>

<LayoutRule>
	{#snippet header()}
		<HeaderArea>
			<a
				href="/write"
				class="block shrink-0 p-3 hover:bg-stone-200 focus:bg-stone-200"
				title="Back to my articles list"
			>
				<IconArrowLeft width="24" height="24" class="rtl:rotate-180" />
			</a>
			<div class="min-w-24 px-2 leading-tight">
				<p class="text-stone-700">
					{#if bookStatus === 1}
						Published
					{:else if hasPublishedRevision}
						Rewriting
					{:else}
						Draft
					{/if}
				</p>
				<p class="text-stone-500" title={savedLabel}>
					{isAutoSaved ? 'Saved' : 'Auto save'}
				</p>
			</div>
			<button
				type="button"
				disabled={!isValidTitle}
				title={isValidTitle ? undefined : 'Title is required.'}
				class="mx-1.5 rounded-md bg-primary-200 px-2 py-1 text-lg disabled:bg-stone-200 disabled:text-stone-500 hover:[&:not(:disabled)]:bg-primary-700 hover:[&:not(:disabled)]:text-white focus:[&:not(:disabled)]:bg-primary-700 focus:[&:not(:disabled)]:text-white"
				onclick={finish}>{bookStatus === 1 ? 'Republish' : 'Publish'}</button
			>
		</HeaderArea>
	{/snippet}
	{#snippet contents()}
		<div class="flex flex-col items-center">
			<div class="flex min-h-dvh w-full max-w-[640px] flex-1 flex-col px-4 pb-24 pt-16">
				<TextAreaSingle
					bind:value={title}
					name="title"
					required={true}
					maxlength={data.form.constraints?.title?.maxlength}
					placeholder="Title"
					className="mb-4"
					inputClass="text-[2.25rem] leading-tight font-semibold xs:text-[3.25rem]"
					onInput={autoSave}
				/>
				<TextAreaSingle
					bind:value={subtitle}
					name="subtitle"
					maxlength={data.form.constraints?.subtitle?.maxlength}
					placeholder="Subtitle"
					className="mb-8"
					inputClass="text-[1.5rem] text-stone-500"
					onInput={autoSave}
				/>
				<hr class="mb-8 border-stone-300" />
				<Editor
					bind:value={prologue}
					namespace="book-prologue"
					placeholder="Write introduction... (optional)"
					onInput={autoSave}
				/>
				<p class="mt-8 text-center text-lg text-stone-500">Free area end</p>
				<hr class="my-2 border-t-4 border-double border-stone-300" />
				<p class="mb-8 text-center text-lg text-stone-500">Paid area start</p>
				<Editor
					bind:value={content}
					namespace="book-content"
					placeholder="Paid area... Write your knowledge..."
					onInput={autoSave}
				/>
			</div>
		</div>
	{/snippet}
	{#snippet footerNav()}{/snippet}
</LayoutRule>
