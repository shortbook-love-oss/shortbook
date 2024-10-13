<script lang="ts">
	import {
		CodeNode,
		$createCodeNode as createCodeNode,
		$isCodeNode as isCodeNode
	} from '@lexical/code';
	import { $createListNode as createListNode, ListNode } from '@lexical/list';
	import {
		$createHeadingNode as createHeadingNode,
		$createQuoteNode as createQuoteNode,
		HeadingNode,
		QuoteNode
	} from '@lexical/rich-text';
	import { $setBlocksType as setBlocksType } from '@lexical/selection';
	import { mergeRegister } from '@lexical/utils';
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
	import IconFormatOrderedList from '~icons/mdi/123';
	import IconFormatCode from '~icons/mdi/code';
	import IconFormatCodeBlock from '~icons/mdi/code-block-tags';
	import IconFormatBold from '~icons/mdi/format-bold';
	import IconFormatHeading2 from '~icons/mdi/format-heading-2';
	import IconFormatHeading3 from '~icons/mdi/format-heading-3';
	import IconFormatHeading4 from '~icons/mdi/format-heading-4';
	import IconFormatHeading5 from '~icons/mdi/format-heading-5';
	import IconFormatHeading6 from '~icons/mdi/format-heading-6';
	import IconFormatItalic from '~icons/mdi/format-italic';
	import IconFormatUnorderedList from '~icons/mdi/format-list-bulleted-square';
	import IconFormatParagraph from '~icons/mdi/format-paragraph';
	import IconFormatBlockquote from '~icons/mdi/format-quote-open';
	import IconFormatStrikethrough from '~icons/mdi/format-strikethrough';
	import { findSelectedStartBlock } from '$lib/components/modules/wysiwyg-editor/editor';
	import {
		blockquoteSelect,
		codeBlockSelect,
		headingSelect,
		headingTypeValues,
		orderedListSelect,
		paragraphSelect,
		unorderedListSelect,
		type HeadingTypes
	} from '$lib/utilities/html';
	import type { SelectItemSingle } from '$lib/utilities/select';
	import Dropdown from '$lib/components/layouts/dropdown.svelte';

	type Props = {
		editor: LexicalEditor;
	};
	let { editor }: Props = $props();

	const elementSelect = [
		unorderedListSelect,
		orderedListSelect,
		codeBlockSelect,
		blockquoteSelect,
		...headingSelect,
		paragraphSelect
	];
	type BlockElementSelect = (typeof elementSelect)[number]['value'];

	const elementIndex = {
		p: IconFormatParagraph,
		h2: IconFormatHeading2,
		h3: IconFormatHeading3,
		h4: IconFormatHeading4,
		h5: IconFormatHeading5,
		h6: IconFormatHeading6,
		ul: IconFormatUnorderedList,
		ol: IconFormatOrderedList,
		blockquote: IconFormatBlockquote,
		codeblock: IconFormatCodeBlock
	} satisfies Record<BlockElementSelect, unknown>;

	// Keep state opening the iOS/Android virtual keyboard
	let isOpenKeyboard = $state(false);

	let documentHeight = $state(0);
	let toolbarHeight = $state(0);
	let toolbarTopOffset = $state(0);

	// Selection states
	let canSwitchTextFormat = $state(false);
	let isBold = $state(false);
	let isItalic = $state(false);
	let isStrikethrough = $state(false);
	let isCode = $state(false);

	let selectedBlockType = $state<SelectItemSingle<BlockElementSelect>>(paragraphSelect);

	function setControllerState() {
		const selection = getSelection();
		if (isRangeSelection(selection)) {
			// By Lexical specifications, the contents of a code block cannot set to bold or italic
			canSwitchTextFormat = selection.getNodes().some((node) => {
				return !isCodeNode(node.getTopLevelElement());
			});
			isBold = selection.hasFormat('bold');
			isItalic = selection.hasFormat('italic');
			isStrikethrough = selection.hasFormat('strikethrough');
			isCode = selection.hasFormat('code');

			// Change state of block type controller
			const selectedStartBlock = findSelectedStartBlock(selection);
			if (selectedStartBlock instanceof ParagraphNode) {
				selectedBlockType = paragraphSelect;
			} else if (selectedStartBlock instanceof HeadingNode) {
				const tag = selectedStartBlock.getTag();
				const matchNodeItem = headingSelect.find((item) => item.value === tag);
				if (matchNodeItem) {
					selectedBlockType = matchNodeItem;
				}
			} else if (selectedStartBlock instanceof ListNode) {
				const tag = selectedStartBlock.getTag();
				if (unorderedListSelect.value === tag) {
					selectedBlockType = unorderedListSelect;
				} else if (orderedListSelect.value === tag) {
					selectedBlockType = orderedListSelect;
				}
			} else if (selectedStartBlock instanceof QuoteNode) {
				selectedBlockType = blockquoteSelect;
			} else if (selectedStartBlock instanceof CodeNode) {
				selectedBlockType = codeBlockSelect;
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
				} else if (unorderedListSelect.value === element.value) {
					setBlocksType(selection, () => createListNode('bullet'));
				} else if (orderedListSelect.value === element.value) {
					setBlocksType(selection, () => createListNode('number'));
				} else if (blockquoteSelect.value === element.value) {
					setBlocksType(selection, () => createQuoteNode());
				} else if (codeBlockSelect.value === element.value) {
					setBlocksType(selection, () => createCodeNode());
				}
				selectedBlockType = element;

				// If change to code block or change from it, switch controller clickable
				setControllerState();
			}
		});
	}

	onMount(() => {
		const removeListener = mergeRegister(
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				(_, targetEditor) => {
					if (editor.getKey() === targetEditor.getKey()) {
						setControllerState();
					}
					return false;
				},
				COMMAND_PRIORITY_CRITICAL
			)
		);

		removeListener;
	});

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
							class="-mr-2 p-1"
							aria-label="This line is {selectedBlockType.label}"
						/>
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
									<Component width="28" height="28" />
								{/if}
								<p class="text-nowrap text-lg">{heading.label}</p>
							</button>
						</li>
					{/each}
				</ul>
			</Dropdown>
		</div>
		<button
			type="button"
			disabled={!canSwitchTextFormat}
			title="Bold"
			class="rounded-md disabled:text-stone-400"
			class:bg-stone-300={isBold}
			class:hover:bg-stone-200={!isBold && canSwitchTextFormat}
			onclick={() => dispatchTextCommand('bold')}
		>
			<IconFormatBold width="44" height="44" class="p-1" />
		</button>
		<button
			type="button"
			disabled={!canSwitchTextFormat}
			title="Italic"
			class="rounded-md disabled:text-stone-400"
			class:bg-stone-300={isItalic}
			class:hover:bg-stone-200={!isItalic && canSwitchTextFormat}
			onclick={() => dispatchTextCommand('italic')}
		>
			<IconFormatItalic width="44" height="44" class="p-1" />
		</button>
		<button
			type="button"
			disabled={!canSwitchTextFormat}
			title="Strikethrough"
			class="rounded-md disabled:text-stone-400"
			class:bg-stone-300={isStrikethrough}
			class:hover:bg-stone-200={!isStrikethrough && canSwitchTextFormat}
			onclick={() => dispatchTextCommand('strikethrough')}
		>
			<IconFormatStrikethrough width="44" height="44" class="p-1" />
		</button>
		<button
			type="button"
			disabled={!canSwitchTextFormat}
			title="Code"
			class="rounded-md disabled:text-stone-400"
			class:bg-stone-300={isCode}
			class:hover:bg-stone-200={!isCode && canSwitchTextFormat}
			onclick={() => dispatchTextCommand('code')}
		>
			<IconFormatCode width="44" height="44" class="p-1" />
		</button>
	</div>
</div>
