<script lang="ts">
	import {
		$getSelection as getSelection,
		$isRangeSelection as isRangeSelection,
		type LexicalEditor
	} from 'lexical';
	import { onMount } from 'svelte';
	import { isEditorEmpty } from '$lib/components/modules/wysiwyg-editor/editor';

	type Props = {
		editor: LexicalEditor;
		placeholder: string;
	};
	let { editor, placeholder }: Props = $props();

	let isEmpty = $state(true);

	onMount(() => {
		const removeListener = editor.registerUpdateListener(() => {
			editor.read(() => {
				const selection = getSelection();
				if (!isRangeSelection(selection)) {
					return;
				}
				isEmpty = isEditorEmpty(selection);
			});
		});

		return removeListener;
	});
</script>

{#if isEmpty}
	<p
		class="pointer-events-none absolute start-0 top-0 select-none text-[1.375rem] leading-[1.625] tracking-wider text-stone-400"
	>
		{placeholder}
	</p>
{/if}
