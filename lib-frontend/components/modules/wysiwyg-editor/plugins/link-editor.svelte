<script lang="ts">
	import { LinkNode } from '@lexical/link';
	import { $getNearestNodeOfType as getNearestNodeOfType, mergeRegister } from '@lexical/utils';
	import {
		COMMAND_PRIORITY_CRITICAL,
		COMMAND_PRIORITY_HIGH,
		$getSelection as getSelection,
		$isRangeSelection as isRangeSelection,
		KEY_ESCAPE_COMMAND,
		SELECTION_CHANGE_COMMAND,
		type LexicalEditor
	} from 'lexical';
	import { onMount } from 'svelte';
	import { getUrlObject } from '$lib/utilities/url';
	import TextField from '$lib/components/modules/form/text-field.svelte';

	type Props = {
		editor: LexicalEditor;
	};
	let { editor }: Props = $props();

	let url = $state('');
	let errorMessages = $state<string[]>([]);

	let documentWidth = $state(0);
	let documentHeight = $state(0);
	let linkEditorElem = $state<HTMLElement | null>(null);

	let selectedLinkNode = $state<LinkNode | null>(null);

	onMount(() => {
		const removeListener = mergeRegister(
			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				(_, targetEditor) => {
					if (editor.getKey() === targetEditor.getKey()) {
						const node = getSelectedLinkNodes();
						if (node) {
							translateLinkEditor();
						}
						selectedLinkNode = node;
					}
					return false;
				},
				COMMAND_PRIORITY_CRITICAL
			),

			editor.registerCommand(
				KEY_ESCAPE_COMMAND,
				() => {
					if (selectedLinkNode) {
						selectedLinkNode = null;
						return true;
					}
					return false;
				},
				COMMAND_PRIORITY_HIGH
			)
		);

		return removeListener;
	});

	function getSelectedLinkNodes() {
		const selection = getSelection();
		if (!(isRangeSelection(selection) && selection.isCollapsed())) {
			return null;
		}

		const node = selection.anchor.getNode();
		// Find link node even if it contains one or more text nodes
		const selectedLinkNode = getNearestNodeOfType(node, LinkNode);
		if (selectedLinkNode) {
			url = selectedLinkNode.getURL();
		}

		return selectedLinkNode;
	}

	function translateLinkEditor() {
		const anchorElement = window.getSelection()?.anchorNode;
		const editorRootElement = editor.getRootElement();
		if (!anchorElement || !editorRootElement || !editorRootElement.contains(anchorElement)) {
			return;
		}

		const boundingElement = anchorElement.parentElement;
		const domRect = boundingElement?.getBoundingClientRect();
		if (linkEditorElem && boundingElement && domRect) {
			const linkEditorWidth = linkEditorElem.offsetWidth;
			const linkEditorHeight = linkEditorElem.offsetHeight;

			let positionTop = window.scrollY + domRect.top + domRect.height + 4;
			if (window.innerHeight - domRect.bottom < linkEditorHeight + 4) {
				// If edit dialog overflows to the bottom, move it to the bottom edge of window (and add margin)
				positionTop = window.scrollY + domRect.top - linkEditorHeight - 4;
			}
			linkEditorElem.style.top = positionTop + 'px';

			let positionLeft = window.scrollX + domRect.left - 8;
			if (positionLeft + linkEditorWidth > documentWidth) {
				// If edit dialog overflows to the right, move it to the right edge of window (and add margin)
				positionLeft -= positionLeft + linkEditorWidth - documentWidth + 4;
			}
			linkEditorElem.style.left = positionLeft + 'px';
		}
	}

	function changeLink(event: SubmitEvent) {
		event.preventDefault();
		errorMessages = [];
		const submitUrl = getUrlObject(url);
		if (submitUrl) {
			editor.update(() => {
				selectedLinkNode?.setURL(submitUrl.href);
				selectedLinkNode = null;
			});
		} else {
			errorMessages.push('Invalid URL');
		}
	}
</script>

<svelte:body bind:clientWidth={documentWidth} bind:clientHeight={documentHeight} />

{#if selectedLinkNode}
	<form
		bind:this={linkEditorElem}
		class="absolute flex flex-col items-end gap-2 rounded-lg border border-stone-300 bg-stone-50/95 p-2 xs:flex-row xs:items-center"
		onsubmit={changeLink}
	>
		<TextField bind:value={url} name="url" type="url" required={true} inputClass="bg-white w-72" />
		<button
			class="rounded-md border border-primary-700 bg-primary-100 px-3 py-1 text-lg hover:bg-primary-200 focus:bg-primary-200"
			>Change</button
		>
	</form>
{/if}
