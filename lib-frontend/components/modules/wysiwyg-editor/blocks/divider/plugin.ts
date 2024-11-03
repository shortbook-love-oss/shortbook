import { mergeRegister } from '@lexical/utils';
import {
	CLICK_COMMAND,
	COMMAND_PRIORITY_NORMAL,
	createCommand,
	SELECTION_CHANGE_COMMAND,
	type LexicalCommand,
	type LexicalEditor
} from 'lexical';
import { dividerNodeAttr } from '$lib/components/modules/wysiwyg-editor/blocks/divider/dom';
import {
	$isDividerNode,
	DividerNode
} from '$lib/components/modules/wysiwyg-editor/blocks/divider/node';
import {
	getSelectedBlock,
	insertBlockNodeToNext,
	selectSingleNode
} from '$lib/components/modules/wysiwyg-editor/editor';

export const INSERT_DIVIDER_BLOCK_COMMAND: LexicalCommand<void> = createCommand(
	'INSERT_DIVIDER_BLOCK_COMMAND'
);

function insertImagePlaceholders() {
	const { selectedBlock } = getSelectedBlock();
	if (!selectedBlock) {
		return false;
	}

	const insertNode = new DividerNode();
	insertBlockNodeToNext(selectedBlock, insertNode);

	return true;
}

function setFocusStyle(editor: LexicalEditor) {
	const { selectedBlock } = getSelectedBlock();
	if (!$isDividerNode(selectedBlock)) {
		setImageFocused(null);
		return false;
	}

	const nodeRootElem = editor.getElementByKey(selectedBlock.getKey());
	if (!(nodeRootElem instanceof HTMLElement)) {
		setImageFocused(null);
		return false;
	}
	setImageFocused(nodeRootElem);

	return true;
}

function selectDividerNode(event: MouseEvent) {
	const nodeRootElem = (event.target as HTMLImageElement | null)?.closest(`[${dividerNodeAttr}]`);
	const nodeKey = nodeRootElem?.getAttribute(dividerNodeAttr);
	if (!nodeKey) {
		setImageFocused(null);
		return false;
	}
	selectSingleNode(nodeKey);

	return true;
}

function setImageFocused(targetImageElem: HTMLElement | null) {
	const classList = ['outline', 'outline-4', 'outline-primary-500'];
	document.querySelectorAll(`[${dividerNodeAttr}]`).forEach((imageElem) => {
		if (imageElem !== targetImageElem) {
			imageElem.classList.remove(...classList);
		}
	});
	if (targetImageElem) {
		targetImageElem.classList.add(...classList);
	}
}

export function registerDividerBlock(editor: LexicalEditor) {
	const removeListener = mergeRegister(
		editor.registerCommand(
			INSERT_DIVIDER_BLOCK_COMMAND,
			() => {
				return insertImagePlaceholders();
			},
			COMMAND_PRIORITY_NORMAL
		),
		editor.registerCommand(
			CLICK_COMMAND,
			(event) => {
				return selectDividerNode(event);
			},
			COMMAND_PRIORITY_NORMAL
		),
		editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			() => {
				return setFocusStyle(editor);
			},
			COMMAND_PRIORITY_NORMAL
		)
	);

	return removeListener;
}
