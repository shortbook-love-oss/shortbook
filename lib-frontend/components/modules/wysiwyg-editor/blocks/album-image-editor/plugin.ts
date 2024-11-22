import { mergeRegister } from '@lexical/utils';
import {
	$getNodeByKey,
	CLICK_COMMAND,
	COMMAND_PRIORITY_NORMAL,
	createCommand,
	SELECTION_CHANGE_COMMAND,
	type LexicalCommand,
	type LexicalEditor
} from 'lexical';
import { env as envPublic } from '$env/dynamic/public';
import {
	imageNodeActivatorAttr,
	imageNodeAttr
} from '$lib/components/modules/wysiwyg-editor/blocks/album-image-editor/dom';
import {
	$createImageNode,
	$isImageNode
} from '$lib/components/modules/wysiwyg-editor/blocks/album-image-editor/node';
import { ImageUploadingNode } from '$lib/components/modules/wysiwyg-editor/blocks/album-image-uploading/node';
import {
	editorImageMaxWidth,
	getImageSizeForSrc,
	getSelectedBlock,
	insertBlockNodeToNext,
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
	return `${envPublic.PUBLIC_ORIGIN_IMAGE_CDN}/user-album/${albumImage.userId}/${albumImage.filePath}`;
}

function insertImage(albumImage: AlbumImageItem) {
	const { selectedBlock } = getSelectedBlock();
	if (!selectedBlock) {
		return false;
	}

	const imageNode = $createImageNode(
		albumImage.id,
		getImageSrc(albumImage),
		albumImage.alt,
		albumImage.width,
		albumImage.height,
		albumImage.toExtension,
		''
	);
	insertBlockNodeToNext(selectedBlock, imageNode);

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
	const imageSize = getImageSizeForSrc(albumImage.width, editorImageMaxWidth);

	const imgCacher = document.createElement('img');
	imgCacher.src = `${imageSrc}?ext=${albumImage.toExtension}&${imageSize}q=60`;
	imgCacher.onload = () => {
		editor.update(
			() => {
				URL.revokeObjectURL(imageUploaderNode.getDataUrl());
				const imageNode = $createImageNode(
					albumImage.id,
					imageSrc,
					albumImage.alt,
					albumImage.width,
					albumImage.height,
					albumImage.toExtension,
					''
				);
				imageUploaderNode.replace(imageNode);
			},
			{ tag: 'history-merge' }
		);
	};

	return true;
}

function toActiveImageDOM(event: MouseEvent) {
	const imageElem = (event.target as HTMLImageElement | null)?.closest(`[${imageNodeAttr}]`);
	const nodeKey = imageElem?.getAttribute(imageNodeAttr);
	if (!nodeKey) {
		setImageFocused(null);
		return false;
	}
	selectSingleNode(nodeKey);

	return true;
}

function getSelectedImageElem(editor: LexicalEditor) {
	const { selectedBlock } = getSelectedBlock();
	if (!$isImageNode(selectedBlock)) {
		setImageFocused(null);
		return false;
	}

	const nodeRootElem = editor.getElementByKey(selectedBlock.getKey());
	const imageElem = nodeRootElem?.querySelector(`[${imageNodeActivatorAttr}]`);
	if (!imageElem || !(imageElem instanceof HTMLImageElement)) {
		setImageFocused(null);
		return false;
	}
	setImageFocused(imageElem);

	return imageElem;
}

function setImageFocused(targetImageElem: HTMLImageElement | null) {
	const classList = ['outline', 'outline-4', 'outline-primary-500'];
	document.querySelectorAll(`[${imageNodeActivatorAttr}]`).forEach((imageElem) => {
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
