<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { BookDraftUpdateResult } from '$lib/utilities/book';
	import TextAreaSingle from '$lib/components/modules/form/text-area-single.svelte';
	import Editor from '$lib/components/modules/wysiwyg-editor/editor.svelte';
	import EditorHeader from '$lib/components/service/write/editor-header.svelte';
	import LayoutRule from '$lib/components/service/layout-rule.svelte';
	import Meta from '$lib/components/service/meta.svelte';

	let { data } = $props();

	let title = $state(data.form.data.title);
	let subtitle = $state(data.form.data.subtitle);
	let prologue = $state(data.prologue);
	let content = $state(data.content);
	let bookId = $state(data.bookId);
	let urlSlug = $state(data.initUrlSlug);

	let initTitle = $state(data.initTitle);
	let isAutoSaved = $state(false);

	let autoSaveTimeout = $state(0);
	function autoSave() {
		window.clearTimeout(autoSaveTimeout);
		autoSaveTimeout = window.setTimeout(async () => {
			autoSaveTimeout = 0;
			await save();
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
				prologue: JSON.stringify(prologue),
				content: JSON.stringify(content),
				bookId,
				urlSlug
			})
		})
			.then(async (res) => {
				const result = (await res.json()) as BookDraftUpdateResult;
				isAutoSaved = true;
				initTitle = title;
				bookId = result.bookId;
				urlSlug = result.urlSlug;
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
		<EditorHeader
			bookStatus={data.bookStatus}
			lastSaved={data.updatedAt}
			{isAutoSaved}
			onSave={finish}
		/>
	{/snippet}
	{#snippet contents()}
		<div class="flex flex-col items-center">
			<div class="flex min-h-dvh w-full max-w-[640px] flex-1 flex-col px-4 pb-20 pt-16 sm:pb-24">
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
				<hr class="my-8 border-stone-300" />
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
