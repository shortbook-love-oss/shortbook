<script lang="ts">
	import { CodeHighlightNode, CodeNode, registerCodeHighlighting } from '@lexical/code';
	import { registerDragonSupport } from '@lexical/dragon';
	import { createEmptyHistoryState, registerHistory } from '@lexical/history';
	import { LinkNode } from '@lexical/link';
	import { ListItemNode, ListNode } from '@lexical/list';
	import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
	import { mergeRegister } from '@lexical/utils';
	import { createEditor, type CreateEditorArgs } from 'lexical';
	import { onMount } from 'svelte';
	import Toolbar from './plugins/toolbar.svelte';
	import type { EditorState } from './editor';

	type Props = {
		value: EditorState;
		namespace: string;
	};
	let { value = $bindable(), namespace }: Props = $props();

	let editorRootElem = $state<HTMLElement | null>(null);

	const initialConfig: CreateEditorArgs = {
		namespace,
		nodes: [CodeHighlightNode, CodeNode, HeadingNode, LinkNode, ListNode, ListItemNode, QuoteNode],
		onError: (error: Error) => {
			throw error;
		},
		theme: {
			root: 'h-full font-sans text-[1.375rem] leading-[1.625] tracking-wider text-stone-950 underline-offset-[0.15em] outline-none',
			code: 'my-4 block bg-slate-100 px-3 py-2 text-[0.875em]',
			heading: {
				h1: '[&:not(:first-child)]:mt-8 mb-4 text-[3.5em] font-semibold leading-[1.25]',
				h2: '[&:not(:first-child)]:mt-8 mb-4 text-[2.5em] font-semibold leading-[1.25]',
				h3: '[&:not(:first-child)]:mt-8 mb-4 text-[2em] font-semibold leading-[1.25]',
				h4: 'my-4 text-[1.5em] font-semibold leading-[1.25]',
				h5: 'my-4 text-[1.25em] font-semibold leading-[1.25]',
				h6: 'my-4 text-[1.1em] font-semibold leading-[1.25]'
			},
			link: 'cursor-pointer text-primary-700 underline',
			list: {
				ol: 'my-4 list-decimal ps-8',
				ul: 'my-4 list-disc ps-6'
			},
			quote: 'my-4 rounded-2xl bg-stone-200/80 p-6 text-[1.25em]',
			text: {
				code: 'bg-slate-100 p-1 text-[0.875em]'
			}
		}
	};
	const editor = createEditor(initialConfig);

	onMount(() => {
		editor.setRootElement(editorRootElem);

		// Registring editor plugins
		mergeRegister(
			registerRichText(editor),
			registerCodeHighlighting(editor),
			registerDragonSupport(editor),
			registerHistory(editor, createEmptyHistoryState(), 300)
		);

		if (value) {
			const parsedEditorState = editor.parseEditorState(value);
			editor.setEditorState(parsedEditorState, { tag: 'history-merge' });
		}

		editor.registerUpdateListener(({ editorState }) => {
			value = editorState.toJSON() as EditorState;
		});
	});
</script>

<div class="flex flex-col items-center">
	<div class="pb-12">
		<div bind:this={editorRootElem} contenteditable></div>
	</div>
	<Toolbar {editor} />
</div>
