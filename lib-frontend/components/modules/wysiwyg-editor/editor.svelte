<script lang="ts">
	import { CodeHighlightNode, CodeNode, registerCodeHighlighting } from '@lexical/code';
	import { registerDragonSupport } from '@lexical/dragon';
	import { createEmptyHistoryState, registerHistory } from '@lexical/history';
	import { AutoLinkNode, LinkNode } from '@lexical/link';
	import { ListItemNode, ListNode } from '@lexical/list';
	import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
	import { mergeRegister } from '@lexical/utils';
	import { createEditor, type CreateEditorArgs } from 'lexical';
	import { onMount } from 'svelte';
	import { theme } from '$lib/components/modules/wysiwyg-editor/themes/default';
	import { registerPluginPasteLinkReplacer } from '$lib/components/modules/wysiwyg-editor/plugins/paste-link-replacer';
	import type { EditorState } from '$lib/components/modules/wysiwyg-editor/editor';
	import LinkEditor from '$lib/components/modules/wysiwyg-editor/plugins/link-editor.svelte';
	import Toolbar from '$lib/components/modules/wysiwyg-editor/plugins/toolbar.svelte';

	type Props = {
		value: EditorState;
		namespace: string;
	};
	let { value = $bindable(), namespace }: Props = $props();

	let editorRootElem = $state<HTMLElement | null>(null);

	const initialConfig: CreateEditorArgs = {
		namespace,
		nodes: [
			CodeHighlightNode,
			CodeNode,
			HeadingNode,
			LinkNode,
			AutoLinkNode,
			ListNode,
			ListItemNode,
			QuoteNode
		],
		onError: (error: Error) => {
			throw error;
		},
		theme
	};
	const editor = createEditor(initialConfig);

	onMount(() => {
		editor.setRootElement(editorRootElem);

		// Registring editor plugins
		const removePluginListener = mergeRegister(
			registerRichText(editor),
			registerCodeHighlighting(editor),
			registerDragonSupport(editor),
			registerHistory(editor, createEmptyHistoryState(), 300),
			registerPluginPasteLinkReplacer(editor)
		);

		if (value) {
			const parsedEditorState = editor.parseEditorState(value);
			editor.setEditorState(parsedEditorState, { tag: 'history-merge' });
		}

		const removeUpdateListener = editor.registerUpdateListener(({ editorState }) => {
			value = editorState.toJSON() as EditorState;
		});

		return () => {
			removePluginListener();
			removeUpdateListener();
		};
	});
</script>

<div class="flex flex-1 flex-col items-center">
	<div class="flex w-full flex-1 flex-col pb-8">
		<div bind:this={editorRootElem} contenteditable></div>
	</div>
	<Toolbar {editor} />
	<LinkEditor {editor} />
</div>
