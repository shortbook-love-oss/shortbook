import { mergeRegister } from '@lexical/utils';
import {
	$createParagraphNode,
	$getSelection,
	$isDecoratorNode,
	$isNodeSelection,
	COMMAND_PRIORITY_NORMAL,
	COPY_COMMAND,
	DecoratorNode,
	KEY_BACKSPACE_COMMAND,
	KEY_DELETE_COMMAND,
	KEY_ENTER_COMMAND,
	SELECT_ALL_COMMAND,
	type LexicalEditor
} from 'lexical';
import { getSelectedBlock } from '$lib/components/modules/wysiwyg-editor/editor';

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

function insertLineToNext(editor: LexicalEditor, event: KeyboardEvent | null) {
	if (!(event instanceof KeyboardEvent) || event.isComposing) {
		return false;
	}

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

	// Don't delete if inner-content editing
	const blockElem = editor.getElementByKey(decorateorNode.getKey());
	if (blockElem?.contains(document.activeElement)) {
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

function copySelectedTextInDecorator(event: KeyboardEvent | ClipboardEvent | null) {
	if (!(event instanceof KeyboardEvent)) {
		return false;
	}

	const { selectedBlock } = getSelectedBlock();
	if (!$isDecoratorNode(selectedBlock)) {
		return false;
	}

	const selectedText = window.getSelection()?.toString();
	if (!selectedText) {
		return false;
	}
	navigator.clipboard.writeText(selectedText);

	return true;
}

function selectAllOfEditable(editor: LexicalEditor, event: KeyboardEvent) {
	const eventTarget = event.target as HTMLElement | null;
	const activeElem = document.activeElement;
	if (eventTarget == null || !(activeElem instanceof HTMLElement)) {
		return false;
	}
	const rootElem = editor.getRootElement();
	if (rootElem == null) {
		return false;
	}
	if (rootElem === activeElem || !activeElem.isContentEditable) {
		return false;
	}
	// If focusing the editable area in the decorator node, select its contents

	const nativeSelection = window.getSelection();
	if (nativeSelection == null) {
		return false;
	}

	nativeSelection.removeAllRanges();
	const range = document.createRange();
	range.selectNodeContents(activeElem);
	nativeSelection.addRange(range);

	return true;
}

export function registerDecoratorNodeBase(editor: LexicalEditor) {
	const removeListener = mergeRegister(
		editor.registerCommand(
			KEY_ENTER_COMMAND,
			(ev) => {
				return insertLineToNext(editor, ev);
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
		),
		editor.registerCommand(
			COPY_COMMAND,
			(ev) => {
				return copySelectedTextInDecorator(ev);
			},
			COMMAND_PRIORITY_NORMAL
		),
		editor.registerCommand(
			SELECT_ALL_COMMAND,
			(ev) => {
				return selectAllOfEditable(editor, ev);
			},
			COMMAND_PRIORITY_NORMAL
		)
	);

	return removeListener;
}
