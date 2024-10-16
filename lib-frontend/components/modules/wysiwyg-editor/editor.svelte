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
	import Placeholder from '$lib/components/modules/wysiwyg-editor/plugins/placeholder.svelte';
	import Toolbar from '$lib/components/modules/wysiwyg-editor/plugins/toolbar.svelte';

	type Props = {
		value: EditorState;
		namespace: string;
		oninput?: (value: EditorState) => void;
	};
	let { value = $bindable(), namespace, oninput }: Props = $props();

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

		const removeUpdateListener = editor.registerUpdateListener(({ editorState, dirtyElements }) => {
			if (dirtyElements.size > 0) {
				// Runs only when node adds / changes / removes, not on selection change or focus
				value = editorState.toJSON() as EditorState;
				oninput?.(value);
			}
		});

		return () => {
			removePluginListener();
			removeUpdateListener();
		};
	});
</script>

<div class="flex flex-1 flex-col">
	<div class="relative">
		<Placeholder {editor} placeholder="Write your knowledge..." />
	</div>
	<div bind:this={editorRootElem} contenteditable></div>
	<Toolbar {editor} className="self-center" />
	<LinkEditor {editor} />
</div>
