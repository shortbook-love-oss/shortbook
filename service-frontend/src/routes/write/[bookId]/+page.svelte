<script lang="ts">
	import { page } from '$app/stores';
	import { initEditorState, type EditorState } from '$lib/components/modules/wysiwyg-editor/editor';
	import { bookCreateUrlParam } from '$lib/utilities/book';
	import TextAreaSingle from '$lib/components/modules/form/text-area-single.svelte';
	import Editor from '$lib/components/modules/wysiwyg-editor/editor.svelte';
	import EditorHeader from '$lib/components/service/write/editor-header.svelte';
	import LayoutRule from '$lib/components/service/layout-rule.svelte';
	import Meta from '$lib/components/service/meta.svelte';

	let { data } = $props();

	let title = $state(data.form.data.title);
	let subtitle = $state(data.form.data.subtitle);
	let outputStateJson = $state<EditorState>(initEditorState);
</script>

<svelte:head>
	{#if $page.params.bookId === bookCreateUrlParam}
		<title>Write new book | ShortBook</title>
	{:else}
		<title>Edit "{data.initTitle}" | ShortBook</title>
	{/if}
	<Meta />
	<meta name="robots" content="noindex" />
</svelte:head>

<LayoutRule>
	{#snippet header()}
		<EditorHeader bookStatus={data.bookStatus} lastSaved={data.updatedAt} isAutoSaved={false} />
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
				/>
				<TextAreaSingle
					bind:value={subtitle}
					name="subtitle"
					maxlength={data.form.constraints?.subtitle?.maxlength}
					placeholder="Subtitle"
					className="mb-8"
					inputClass="text-[1.5rem] text-stone-500"
				/>
				<hr class="mb-8 border-stone-300" />
				<Editor bind:value={outputStateJson} namespace="book-editor" />
			</div>
		</div>
	{/snippet}
	{#snippet footerNav()}{/snippet}
</LayoutRule>
