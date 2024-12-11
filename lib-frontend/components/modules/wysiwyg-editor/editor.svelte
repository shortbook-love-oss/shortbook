<script lang="ts">
	import { createEditor } from 'lexical';
	import { onMount } from 'svelte';
	import {
		initEditorConfig,
		isEditorEmpty,
		lastActiveEditor,
		registerEditorPlugins,
		type EditorState
	} from '$lib/components/modules/wysiwyg-editor/editor';
	import AlbumDragUploader from '$lib/components/modules/wysiwyg-editor/plugins/album-drag-uploader.svelte';
	import LinkEditor from '$lib/components/modules/wysiwyg-editor/plugins/link-editor.svelte';
	import Placeholder from '$lib/components/modules/wysiwyg-editor/plugins/placeholder.svelte';
	import Toolbar from '$lib/components/modules/wysiwyg-editor/plugins/toolbar.svelte';

	type Props = {
		value: EditorState;
		hasContent: boolean;
		namespace: string;
		placeholder?: string;
		onInput?: () => void;
	};
	let {
		value = $bindable(),
		hasContent = $bindable(),
		namespace,
		placeholder = '',
		onInput
	}: Props = $props();

	let editorRootElem = $state<HTMLElement | null>(null);
	let isActive = $state(false);

	const editor = createEditor({ ...initEditorConfig, namespace });

	onMount(() => {
		editor.setRootElement(editorRootElem);

		// Registring editor plugins
		const removePluginListener = registerEditorPlugins(editor);

		if (value) {
			const parsedEditorState = editor.parseEditorState(value);
			editor.setEditorState(parsedEditorState, { tag: 'history-merge' });
			editor.read(() => {
				hasContent = !isEditorEmpty(editor);
			});
		}

		const removeUpdateListener = editor.registerUpdateListener(({ editorState, dirtyElements }) => {
			lastActiveEditor.set(editor.getKey());
			if (dirtyElements.size > 0) {
				// Runs only when node adds / changes / removes, not on selection change or focus
				value = editorState.toJSON() as EditorState;
				onInput?.();
				editor.read(() => {
					hasContent = !isEditorEmpty(editor);
				});
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
	<div
		bind:this={editorRootElem}
		contenteditable
		class="sb_bc__root min-h-36 flex-1 outline-none"
	></div>
	<div class="contents" class:hidden={!isActive}>
		<Toolbar {editor} className="self-center" />
		<LinkEditor {editor} />
	</div>
	{#if isActive}
		<AlbumDragUploader {editor} />
	{/if}
</div>
