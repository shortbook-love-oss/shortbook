import { mergeRegister } from '@lexical/utils';
import {
	$getNodeByKey,
	$getSelection,
	$isNodeSelection,
	$isRangeSelection,
	CLICK_COMMAND,
	COMMAND_PRIORITY_NORMAL,
	createCommand,
	SELECTION_CHANGE_COMMAND,
	type LexicalCommand,
	type LexicalEditor
} from 'lexical';
import { env as envPublic } from '$env/dynamic/public';
import {
	$createImageNode,
	imageActivatorAttr,
	ImageNode
} from '$lib/components/modules/wysiwyg-editor/plugins/album-image-editor/node';
import { ImageUploadingNode } from '$lib/components/modules/wysiwyg-editor/plugins/album-image-uploading/node';
import {
	editorImageMaxWidth,
	getImageSizeForSrc,
	insertBlockNodeToNext,
	selectBlockEnd,
	selectSingleNode
} from '$lib/components/modules/wysiwyg-editor/editor';
import type { AlbumImageItem } from '$lib/utilities/album';

export interface AlbumImageNodeItem {
	nodeKey: string;
	albumImage: AlbumImageItem;
}

export const INSERT_IMAGE_BLOCK_COMMAND: LexicalCommand<AlbumImageItem> = createCommand(
	'INSERT_IMAGE_BLOCK_COMMAND'
);
export const CHANGE_IMAGE_BLOCK_COMMAND: LexicalCommand<AlbumImageNodeItem> = createCommand(
	'CHANGE_IMAGE_BLOCK_COMMAND'
);

function getImageSrc(albumImage: AlbumImageItem) {
	const imageSize = getImageSizeForSrc(albumImage.width, editorImageMaxWidth);
	return `${envPublic.PUBLIC_ORIGIN_IMAGE_CDN}/user-album/${albumImage.userId}/${albumImage.filePath}?ext=${albumImage.toExtension}&${imageSize}q=60`;
}

function insertImage(albumImage: AlbumImageItem) {
	const selection = $getSelection();
	if (!$isRangeSelection(selection)) {
		return false;
	}
	selectBlockEnd(selection);

	const imageNode = $createImageNode(
		albumImage.id,
		getImageSrc(albumImage),
		albumImage.alt,
		albumImage.width,
		albumImage.height
	);
	insertBlockNodeToNext(selection, imageNode);

	return true;
}

function replaceByImage(editor: LexicalEditor, imageItem: AlbumImageNodeItem) {
	const imageUploaderNode = $getNodeByKey(imageItem.nodeKey);
	if (!(imageUploaderNode instanceof ImageUploadingNode)) {
		return false;
	}

	// First, cache the image by CDN
	// By doing so, switch quickly to image node
	const albumImage = imageItem.albumImage;
	const imageSrc = getImageSrc(albumImage);
	const imgCacher = document.createElement('img');
	imgCacher.src = imageSrc;
	imgCacher.onload = () => {
		editor.update(
			() => {
				URL.revokeObjectURL(imageUploaderNode.getDataUrl());
				const imageNode = $createImageNode(
					albumImage.id,
					imageSrc,
					albumImage.alt,
					albumImage.width,
					albumImage.height
				);
				imageUploaderNode.replace(imageNode);
			},
			{ tag: 'history-merge' }
		);
	};
	return true;
}

function isImageNodeSelected() {
	const selection = $getSelection();
	if (!$isNodeSelection(selection)) {
		return false;
	}
	const node = selection.getNodes()[0];
	if (!(node instanceof ImageNode)) {
		return false;
	}
	return node;
}

function toActiveImageDOM(event: MouseEvent) {
	const imageElem = event.target as HTMLImageElement | null;
	const nodeKey = imageElem?.getAttribute(imageActivatorAttr);
	if (!nodeKey) {
		toggleImageFocused(null);
		return false;
	}
	selectSingleNode(nodeKey);

	return true;
}

function getSelectedImageElem(editor: LexicalEditor) {
	const imageNode = isImageNodeSelected();
	if (!imageNode) {
		toggleImageFocused(null);
		return false;
	}

	const nodeRootElem = editor.getElementByKey(imageNode.getKey());
	const imageElem = nodeRootElem?.querySelector(`[${imageActivatorAttr}]`);
	if (!imageElem || !(imageElem instanceof HTMLImageElement)) {
		toggleImageFocused(null);
		return false;
	}
	toggleImageFocused(imageElem);

	return imageElem;
}

function toggleImageFocused(targetImageElem: HTMLImageElement | null) {
	const classList = ['outline', 'outline-4', 'outline-primary-500'];
	document.querySelectorAll(`[${imageActivatorAttr}]`).forEach((imageElem) => {
		if (imageElem !== targetImageElem) {
			imageElem.classList.remove(...classList);
		}
	});
	if (targetImageElem) {
		targetImageElem.classList.add(...classList);
	}
}

export function registerImagePlugin(editor: LexicalEditor): () => void {
	const removeListener = mergeRegister(
		editor.registerCommand(
			INSERT_IMAGE_BLOCK_COMMAND,
			(imageItem) => {
				return insertImage(imageItem);
			},
			COMMAND_PRIORITY_NORMAL
		),
		editor.registerCommand(
			CHANGE_IMAGE_BLOCK_COMMAND,
			(imageItem) => {
				return replaceByImage(editor, imageItem);
			},
			COMMAND_PRIORITY_NORMAL
		),
		editor.registerCommand(
			CLICK_COMMAND,
			(event) => {
				return toActiveImageDOM(event);
			},
			COMMAND_PRIORITY_NORMAL
		),
		editor.registerCommand(
			SELECTION_CHANGE_COMMAND,
			() => {
				const imageElem = getSelectedImageElem(editor);
				return imageElem instanceof Element;
			},
			COMMAND_PRIORITY_NORMAL
		)
	);

	return removeListener;
}
