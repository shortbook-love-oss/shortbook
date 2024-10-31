import { mergeRegister } from '@lexical/utils';
import {
	$createParagraphNode,
	$getSelection,
	$isDecoratorNode,
	$isNodeSelection,
	COMMAND_PRIORITY_NORMAL,
	KEY_ENTER_COMMAND,
	type LexicalEditor
} from 'lexical';

function getSelectedNode() {
	const selection = $getSelection();
	if (!$isNodeSelection(selection)) {
		return { selection, decorateorNode: null };
	}
	const decorateorNode = selection.getNodes()[0]?.getTopLevelElement();
	if (!$isDecoratorNode(decorateorNode)) {
		return { selection, decorateorNode: null };
	}
	return { selection, decorateorNode };
}

function insertLineToNext(editor: LexicalEditor) {
	const { decorateorNode } = getSelectedNode();
	if (!decorateorNode) {
		return false;
	}
	const insertedNode = decorateorNode.insertAfter($createParagraphNode());
	// Prevent insert twice block by slight delay
	requestAnimationFrame(() => {
		editor.update(() => {
			insertedNode.selectStart();
		});
	});

	return true;
}

export function registerDecoratorNodeBase(editor: LexicalEditor) {
	const removeListener = mergeRegister(
		editor.registerCommand(
			KEY_ENTER_COMMAND,
			() => {
				return insertLineToNext(editor);
			},
			COMMAND_PRIORITY_NORMAL
		)
	);

	return removeListener;
}
