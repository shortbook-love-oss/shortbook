<script lang="ts">
	import { $createHeadingNode as createHeadingNode, HeadingNode } from '@lexical/rich-text';
	import { $setBlocksType as setBlocksType } from '@lexical/selection';
	import {
		COMMAND_PRIORITY_CRITICAL,
		$createParagraphNode as createParagraphNode,
		FORMAT_TEXT_COMMAND,
		$getSelection as getSelection,
		$isRangeSelection as isRangeSelection,
		ParagraphNode,
		SELECTION_CHANGE_COMMAND,
		type LexicalEditor,
		type TextFormatType
	} from 'lexical';
	import { onMount } from 'svelte';
	import IconArrow from '~icons/mdi/chevron-up';
	import IconFormatCode from '~icons/mdi/code';
	import IconFormatBold from '~icons/mdi/format-bold';
	import IconFormatHeading2 from '~icons/mdi/format-heading-2';
	import IconFormatHeading3 from '~icons/mdi/format-heading-3';
	import IconFormatHeading4 from '~icons/mdi/format-heading-4';
	import IconFormatHeading5 from '~icons/mdi/format-heading-5';
	import IconFormatHeading6 from '~icons/mdi/format-heading-6';
	import IconFormatItalic from '~icons/mdi/format-italic';
	import IconFormatParagraph from '~icons/mdi/format-paragraph';
	import IconFormatStrikethrough from '~icons/mdi/format-strikethrough';
	import {
		headingSelect,
		headingTypeValues,
		paragraphSelect,
		type HeadingTypes
	} from '$lib/utilities/html';
	import Dropdown from '$lib/components/layouts/dropdown.svelte';
	import type { SelectItemSingle } from '$lib/utilities/select';

	type Props = {
		editor: LexicalEditor;
	};
	let { editor }: Props = $props();

	const elementSelect = [paragraphSelect, ...headingSelect];
	type BlockElementSelect = (typeof elementSelect)[number]['value'];

	// Keep state opening the iOS/Android virtual keyboard
	let isOpenKeyboard = $state(false);

	let documentHeight = $state(0);
	let toolbarHeight = $state(0);
	let toolbarTopOffset = $state(0);

	// Selection states
	let isBold = $state(false);
	let isItalic = $state(false);
	let isStrikethrough = $state(false);
	let isCode = $state(false);

	let selectedBlockType = $state<SelectItemSingle<BlockElementSelect>>(paragraphSelect);
	const elementIndex = {
		p: IconFormatParagraph,
		h2: IconFormatHeading2,
		h3: IconFormatHeading3,
		h4: IconFormatHeading4,
		h5: IconFormatHeading5,
		h6: IconFormatHeading6
	} satisfies Record<BlockElementSelect, unknown>;

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
			isStrikethrough = selection.hasFormat('strikethrough');
			isCode = selection.hasFormat('code');

			// Find block node of lexical editor state, not text node in the block node
			let selectStartBlock;
			const selectStartNode = selection.anchor.getNode();
			const selectStartNodeParent = selectStartNode.getParent();
			if (selectStartNodeParent && selectStartNodeParent.getKey() !== 'root') {
				selectStartBlock = selectStartNodeParent;
			} else {
				selectStartBlock = selectStartNode;
			}

			// Change state of block type controller
			if (selectStartBlock instanceof ParagraphNode) {
				selectedBlockType = paragraphSelect;
			} else if (selectStartBlock instanceof HeadingNode) {
				const headingTag = selectStartBlock.getTag();
				const matchHeadingItem = headingSelect.find((item) => item.value === headingTag);
				if (matchHeadingItem) {
					selectedBlockType = matchHeadingItem;
				}
			}
		}
	}

	function dispatchTextCommand(command: TextFormatType) {
		editor.dispatchCommand(FORMAT_TEXT_COMMAND, command);
	}

	function dispatchBlockCommand(element: SelectItemSingle<BlockElementSelect>) {
		editor.update(() => {
			const selection = getSelection();
			if (isRangeSelection(selection)) {
				if (paragraphSelect.value === element.value) {
					setBlocksType(selection, () => createParagraphNode());
				} else if (headingTypeValues.includes(element.value as HeadingTypes)) {
					setBlocksType(selection, () => createHeadingNode(element.value as HeadingTypes));
				}
				selectedBlockType = element;
			}
		});
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
		class="flex rounded-t-lg border-x border-t border-stone-300 bg-stone-50/95 p-1 sm:mb-4 sm:rounded-b-lg sm:border-b"
	>
		<div class="relative">
			<Dropdown
				name="editor_control_heading_select"
				openerClass="h-full rounded-md"
				dropdownClass="bottom-14"
			>
				{#snippet opener()}
					{@const SelectedBlockComponent = elementIndex[selectedBlockType.value]}
					<div class="flex items-center">
						<SelectedBlockComponent
							width="44"
							height="44"
							class="-mr-2 p-1 xs:hidden"
							aria-label="Change this line to {selectedBlockType.text}"
						/>
						<p class="pl-2 text-2xl max-xs:hidden">{selectedBlockType.text}</p>
						<IconArrow width="32" height="32" />
					</div>
				{/snippet}
				<ul>
					{#each elementSelect as heading}
						<li>
							<button
								type="button"
								class="flex w-full items-center gap-2 rounded-md p-2 {selectedBlockType.value ===
								heading.value
									? 'bg-stone-300'
									: 'hover:bg-stone-200'}"
								onclick={() => dispatchBlockCommand(heading)}
							>
								{#if elementIndex[heading.value]}
									{@const Component = elementIndex[heading.value]}
									<Component width="32" height="32" />
								{/if}
								<p class="text-nowrap text-xl">{heading.label}</p>
							</button>
						</li>
					{/each}
				</ul>
			</Dropdown>
		</div>
		<button
			type="button"
			title="Bold"
			class="rounded-md {isBold ? 'bg-stone-300' : 'hover:bg-stone-200'}"
			onclick={() => dispatchTextCommand('bold')}
		>
			<IconFormatBold width="44" height="44" class="p-1" />
		</button>
		<button
			type="button"
			title="Italic"
			class="rounded-md {isItalic ? 'bg-stone-300' : 'hover:bg-stone-200'}"
			onclick={() => dispatchTextCommand('italic')}
		>
			<IconFormatItalic width="44" height="44" class="p-1" />
		</button>
		<button
			type="button"
			title="Strikethrough"
			class="rounded-md {isStrikethrough ? 'bg-stone-300' : 'hover:bg-stone-200'}"
			onclick={() => dispatchTextCommand('strikethrough')}
		>
			<IconFormatStrikethrough width="44" height="44" class="p-1" />
		</button>
		<button
			type="button"
			title="Code"
			class="rounded-md {isCode ? 'bg-stone-300' : 'hover:bg-stone-200'}"
			onclick={() => dispatchTextCommand('code')}
		>
			<IconFormatCode width="44" height="44" class="p-1" />
		</button>
	</div>
</div>
