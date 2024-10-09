import { LinkNode, TOGGLE_LINK_COMMAND, $toggleLink as toggleLink } from '@lexical/link';
import { mergeRegister, objectKlassEquals } from '@lexical/utils';
import {
	COMMAND_PRIORITY_LOW,
	$getSelection as getSelection,
	$isElementNode as isElementNode,
	$isRangeSelection as isRangeSelection,
	PASTE_COMMAND,
	TextNode,
	type LexicalEditor
} from 'lexical';
import { getUrlObject } from '$lib/utilities/url';

export function registerPluginPasteLinkReplacer(editor: LexicalEditor) {
	const removeListener = mergeRegister(
		editor.registerCommand(
			TOGGLE_LINK_COMMAND,
			(payload) => {
				if (payload === null) {
					toggleLink(payload);
					return true;
				} else if (typeof payload === 'string') {
					const urlObject = getUrlObject(payload);
					if (urlObject) {
						toggleLink(urlObject.href, { target: '_blank' });
						return true;
					}
					return false;
				} else {
					const { url, target, rel, title } = payload;
					toggleLink(url, { rel, target, title });
					return true;
				}
			},
			COMMAND_PRIORITY_LOW
		),

		editor.registerCommand(
			PASTE_COMMAND,
			(event) => {
				const selection = getSelection();
				if (!isRangeSelection(selection) || !objectKlassEquals(event, ClipboardEvent)) {
					return false;
				}
				const clipboardEvent = event as ClipboardEvent;
				if (clipboardEvent.clipboardData === null) {
					return false;
				}
				const clipboardText = clipboardEvent.clipboardData.getData('text');
				const urlObject = getUrlObject(clipboardText);
				if (!urlObject) {
					return false;
				}

				if (selection.isCollapsed()) {
					// If not selected, just paste the URL as link node
					selection.insertNodes([
						new LinkNode(urlObject.href, { target: '_blank' }).append(new TextNode(urlObject.href))
					]);
					event.preventDefault();
					return true;
				}

				if (!selection.getNodes().some((node) => isElementNode(node))) {
					// If we select nodes that are elements then avoid applying the link
					editor.dispatchCommand(TOGGLE_LINK_COMMAND, { url: urlObject.href, target: '_blank' });
					event.preventDefault();
					return true;
				}

				return false;
			},
			COMMAND_PRIORITY_LOW
		)
	);
	return removeListener;
}
