<script lang="ts">
	import {
		COMMAND_PRIORITY_CRITICAL,
		FORMAT_TEXT_COMMAND,
		$getSelection as getSelection,
		$isRangeSelection as isRangeSelection,
		type LexicalEditor,
		SELECTION_CHANGE_COMMAND,
		type TextFormatType
	} from 'lexical';
	import { onMount } from 'svelte';
	import FormatBold from '~icons/mdi/format-bold';
	import FormatItalic from '~icons/mdi/format-italic';

	type Props = {
		editor: LexicalEditor;
	};
	let { editor }: Props = $props();

	// Keep state opening the iOS/Android virtual keyboard
	let isOpenKeyboard = $state(false);

	let documentHeight = $state(0);
	let toolbarHeight = $state(0);
	let toolbarTopOffset = $state(0);

	// Selection states
	let isBold = $state(false);
	let isItalic = $state(false);

	editor.registerCommand(
		SELECTION_CHANGE_COMMAND,
		(_, targetEditor) => {
			if (editor.getKey() === targetEditor.getKey()) {
				setControllerState();
			}
			return false;
		},
		COMMAND_PRIORITY_CRITICAL
	);

	function setControllerState() {
		const selection = getSelection();
		if (isRangeSelection(selection)) {
			isBold = selection.hasFormat('bold');
			isItalic = selection.hasFormat('italic');
		}
	}

	function dispatchTextCommand(command: TextFormatType) {
		editor.dispatchCommand(FORMAT_TEXT_COMMAND, command);
	}

	onMount(() => {
		const onViewportResize = () => {
			if (!visualViewport) {
				isOpenKeyboard = false;
				return;
			}
			// If iOS and Android, visualViewport.height is low when virtual keyboard is open
			isOpenKeyboard = window.innerHeight !== visualViewport.height;
		};
		visualViewport?.addEventListener('resize', onViewportResize);

		return () => {
			visualViewport?.removeEventListener('resize', onViewportResize);
		};
	});

	onMount(() => {
		const toolbarPositionAdjuster = setInterval(() => {
			if (visualViewport && isOpenKeyboard) {
				// position: fixed; and bottom specification does not work when the virtual keyboard is displayed
				// So, combine absolute and top to position the toolbar slightly above the virtual keyboard
				const currentTopOffset = window.scrollY + visualViewport.height - toolbarHeight;
				const maxTopOffset = documentHeight - toolbarHeight;
				toolbarTopOffset = Math.min(currentTopOffset, maxTopOffset);
			}
		}, 50);

		return () => {
			clearInterval(toolbarPositionAdjuster);
		};
	});
</script>

<svelte:body bind:clientHeight={documentHeight} />

<!-- To ensure that the software keyboard maintains its distance from the bottom even when it appears, adjustments are made using JavaScript -->
<div
	bind:clientHeight={toolbarHeight}
	class="transition-[top] duration-150"
	style:position={isOpenKeyboard ? 'absolute' : 'fixed'}
	style:top={isOpenKeyboard ? toolbarTopOffset + 'px' : 'auto'}
	style:bottom={isOpenKeyboard ? undefined : '0'}
>
	<div
		class="flex gap-1 rounded-t-md border-x border-t border-stone-300 bg-stone-50/95 p-1 sm:mb-4 sm:rounded-b-md sm:border-b"
	>
		<button
			type="button"
			title="Bold"
			class="rounded-md {isBold ? 'bg-stone-300' : 'hover:bg-stone-200'}"
			onclick={() => dispatchTextCommand('bold')}
		>
			<FormatBold width="40" height="40" class="p-1" />
		</button>
		<button
			type="button"
			title="Italic"
			class="rounded-md {isItalic ? 'bg-stone-300' : 'hover:bg-stone-200'}"
			onclick={() => dispatchTextCommand('italic')}
		>
			<FormatItalic width="40" height="40" class="p-1" />
		</button>
	</div>
</div>
