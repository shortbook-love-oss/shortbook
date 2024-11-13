import { $isListItemNode } from '@lexical/list';
import { mergeRegister, objectKlassEquals } from '@lexical/utils';
import {
	$createParagraphNode,
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_LOW,
	KEY_ENTER_COMMAND,
	type LexicalEditor
} from 'lexical';

export function registerListItemEscape(editor: LexicalEditor) {
	const removeListener = mergeRegister(
		editor.registerCommand(
			KEY_ENTER_COMMAND,
			(payload) => {
				if (payload == null) {
					return true;
				}
				const selection = $getSelection();
				if (
					!objectKlassEquals(payload, KeyboardEvent) ||
					!$isRangeSelection(selection) ||
					!selection.isCollapsed()
				) {
					return false;
				}

				const node = selection.anchor.getNode();
				// Selecting node is ListItemNode if it has no text
				if (!$isListItemNode(node)) {
					return false;
				}
				// Prevent insert a list-item node
				payload.preventDefault();
				const insertedNode = node.insertAfter($createParagraphNode(), true);

				requestAnimationFrame(() => {
					editor.update(
						() => {
							// "select***" methods should run after next-tick
							// Because insert an unexpectedly empty node when select in same-tick
							insertedNode.selectStart();
							node.remove();
						},
						{ tag: 'history-merge' }
					);
				});

				return true;
			},
			COMMAND_PRIORITY_LOW
		)
	);
	return removeListener;
}
