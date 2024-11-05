<script lang="ts">
	import { registerCodeHighlighting } from '@lexical/code';
	import { registerDragonSupport } from '@lexical/dragon';
	import { createEmptyHistoryState, registerHistory } from '@lexical/history';
	import { registerRichText } from '@lexical/rich-text';
	import { mergeRegister } from '@lexical/utils';
	import { createEditor } from 'lexical';
	import { onMount } from 'svelte';
	import { registerImagePlugin } from '$lib/components/modules/wysiwyg-editor/blocks/album-image-editor/plugin';
	import { registerImageUploaderPlugin } from '$lib/components/modules/wysiwyg-editor/blocks/album-image-uploading/plugin';
	import { registerDividerBlock } from '$lib/components/modules/wysiwyg-editor/blocks/divider/plugin';
	import { registerDecoratorNodeBase } from '$lib/components/modules/wysiwyg-editor/blocks/decorator-node-base';
	import { registerPluginPasteLinkReplacer } from '$lib/components/modules/wysiwyg-editor/plugins/paste-link-replacer';
	import {
		initEditorConfig,
		lastActiveEditor,
		type EditorState
	} from '$lib/components/modules/wysiwyg-editor/editor';
	import AlbumDragUploader from '$lib/components/modules/wysiwyg-editor/plugins/album-drag-uploader.svelte';
	import LinkEditor from '$lib/components/modules/wysiwyg-editor/plugins/link-editor.svelte';
	import Placeholder from '$lib/components/modules/wysiwyg-editor/plugins/placeholder.svelte';
	import Toolbar from '$lib/components/modules/wysiwyg-editor/plugins/toolbar.svelte';

	type Props = {
		value: EditorState;
		namespace: string;
		placeholder?: string;
		onInput?: (value: EditorState) => void;
	};
	let { value = $bindable(), namespace, placeholder = '', onInput }: Props = $props();

	let editorRootElem = $state<HTMLElement | null>(null);
	let isActive = $state(false);

	const editor = createEditor({ ...initEditorConfig, namespace });

	onMount(() => {
		editor.setRootElement(editorRootElem);

		// Registring editor plugins
		const removePluginListener = mergeRegister(
			registerRichText(editor),
			registerCodeHighlighting(editor),
			registerDragonSupport(editor),
			registerHistory(editor, createEmptyHistoryState(), 300),
			registerPluginPasteLinkReplacer(editor),
			registerDecoratorNodeBase(editor),
			registerImagePlugin(editor),
			registerImageUploaderPlugin(editor),
			registerDividerBlock(editor)
		);

		if (value) {
			const parsedEditorState = editor.parseEditorState(value);
			editor.setEditorState(parsedEditorState, { tag: 'history-merge' });
		}

		const removeUpdateListener = editor.registerUpdateListener(({ editorState, dirtyElements }) => {
			lastActiveEditor.set(editor.getKey());
			if (dirtyElements.size > 0) {
				// Runs only when node adds / changes / removes, not on selection change or focus
				value = editorState.toJSON() as EditorState;
				onInput?.(value);
			}
		});

		// Only one editor is active even if there are multiple editors
		const unsubscribeActiveObserver = lastActiveEditor.subscribe((activeEditorKey) => {
			isActive = editor.getKey() === activeEditorKey;
		});

		return () => {
			removePluginListener();
			removeUpdateListener();
			unsubscribeActiveObserver();
		};
	});
</script>

<div class="flex flex-1 flex-col">
	<div class="relative">
		<Placeholder {editor} {placeholder} />
	</div>
	<div bind:this={editorRootElem} contenteditable></div>
	<div class="contents" class:hidden={!isActive}>
		<Toolbar {editor} className="self-center" />
		<LinkEditor {editor} />
	</div>
	{#if isActive}
		<AlbumDragUploader {editor} />
	{/if}
</div>
