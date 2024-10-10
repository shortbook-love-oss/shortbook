<script lang="ts">
	import { LinkNode } from '@lexical/link';
	import {
		COMMAND_PRIORITY_CRITICAL,
		$getSelection as getSelection,
		$isRangeSelection as isRangeSelection,
		SELECTION_CHANGE_COMMAND,
		type LexicalEditor
	} from 'lexical';
	import { $getNearestNodeOfType as getNearestNodeOfType } from '@lexical/utils';
	import { getUrlObject } from '$lib/utilities/url';
	import TextField from '$lib/components/modules/form/text-field.svelte';

	type Props = {
		editor: LexicalEditor;
	};
	let { editor }: Props = $props();

	let url = $state('');
	let errorMessages = $state<string[]>([]);

	let selectedLinkNode = $state<LinkNode | null>(null);

	editor.registerCommand(
		SELECTION_CHANGE_COMMAND,
		(_, targetEditor) => {
			if (editor.getKey() === targetEditor.getKey()) {
				selectedLinkNode = getSelectedLinkNodes();
			}
			return false;
		},
		COMMAND_PRIORITY_CRITICAL
	);

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

	function changeLink(event: SubmitEvent) {
		event.preventDefault();
		errorMessages = [];
		const submitUrl = getUrlObject(url);
		if (submitUrl) {
			editor.update(() => {
				selectedLinkNode?.setURL(submitUrl.href);
			});
		} else {
			errorMessages.push('Invalid URL');
		}
	}
</script>

{#if selectedLinkNode}
	<form
		class="flex rounded-lg border border-stone-300 bg-stone-50/95 p-1 sm:mb-4"
		onsubmit={changeLink}
	>
		<TextField bind:value={url} name="url" type="url" required={true} inputClass="bg-white" />
		<button>Change</button>
	</form>
{/if}
