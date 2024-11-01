import { mergeRegister } from '@lexical/utils';
import {
	$createParagraphNode,
	$getSelection,
	$isDecoratorNode,
	$isNodeSelection,
	COMMAND_PRIORITY_NORMAL,
	DecoratorNode,
	KEY_BACKSPACE_COMMAND,
	KEY_DELETE_COMMAND,
	KEY_ENTER_COMMAND,
	type LexicalEditor
} from 'lexical';

function getSelectedNode() {
	const selection = $getSelection();
	if (!$isNodeSelection(selection)) {
		return { selection, decorateorNode: null };
	}
	const blockNode = selection.getNodes()[0]?.getTopLevelElement();
	if (!$isDecoratorNode(blockNode)) {
		return { selection, decorateorNode: null };
	}
	return { selection, decorateorNode: blockNode as DecoratorNode<HTMLElement> };
}

function insertLineToNext(editor: LexicalEditor) {
	const { decorateorNode } = getSelectedNode();
	if (!decorateorNode) {
		return false;
	}

	const insertedNode = decorateorNode.insertAfter($createParagraphNode());
	// Prevent duplicate exec of commands by slight delay
	requestAnimationFrame(() => {
		editor.update(() => {
			insertedNode.selectStart();
		});
	});

	return true;
}

function deleteNode(editor: LexicalEditor, isBack: boolean) {
	const { decorateorNode } = getSelectedNode();
	if (!decorateorNode) {
		return false;
	}

	// Prevent duplicate exec of commands by slight delay
	requestAnimationFrame(() => {
		editor.update(() => {
			if (!isBack) {
				decorateorNode.selectNext();
			}
			decorateorNode.remove();
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
		),
		editor.registerCommand(
			KEY_BACKSPACE_COMMAND,
			() => {
				return deleteNode(editor, true);
			},
			COMMAND_PRIORITY_NORMAL
		),
		editor.registerCommand(
			KEY_DELETE_COMMAND,
			() => {
				return deleteNode(editor, false);
			},
			COMMAND_PRIORITY_NORMAL
		)
	);

	return removeListener;
}
