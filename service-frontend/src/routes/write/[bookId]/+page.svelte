<script lang="ts">
	import { initEditorState, type EditorState } from '$lib/components/modules/wysiwyg-editor/editor';
	import LayoutRule from '$lib/components/service/layout-rule.svelte';
	import TextAreaSingle from '$lib/components/modules/form/text-area-single.svelte';
	import Editor from '$lib/components/modules/wysiwyg-editor/editor.svelte';
	import Meta from '$lib/components/service/meta.svelte';

	let { data } = $props();

	let title = $state(data.title);
	let subtitle = $state(data.subtitle);
	let outputStateJson = $state<EditorState>(initEditorState);
</script>

<svelte:head>
	<title>Edit "{data.initTitle}" | ShortBook</title>
	<Meta />
	<meta name="robots" content="noindex" />
</svelte:head>

<LayoutRule>
	{#snippet header()}{/snippet}
	{#snippet contents()}
		<div class="flex flex-col items-center">
			<div class="flex min-h-dvh w-full max-w-2xl flex-1 flex-col px-4 pb-16 pt-8 sm:pt-12">
				<TextAreaSingle
					bind:value={title}
					name="title"
					required={true}
					maxlength={data.titleMaxLength}
					placeholder="Title"
					className="mb-8"
					inputClass="text-[3.25rem] font-semibold"
				/>
				<TextAreaSingle
					bind:value={subtitle}
					name="subtitle"
					maxlength={data.subtitleMaxLength}
					placeholder="Subtitle"
					className="mb-8"
					inputClass="text-[1.5rem]"
				/>
				<Editor bind:value={outputStateJson} namespace="book-editor" />
			</div>
		</div>
	{/snippet}
	{#snippet footerNav()}{/snippet}
</LayoutRule>
