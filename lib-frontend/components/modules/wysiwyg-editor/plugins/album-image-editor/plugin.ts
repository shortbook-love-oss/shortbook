import { mergeRegister } from '@lexical/utils';
import {
	$getNodeByKey,
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_NORMAL,
	createCommand,
	type LexicalCommand,
	type LexicalEditor
} from 'lexical';
import { env as envPublic } from '$env/dynamic/public';
import { $createImageNode } from '$lib/components/modules/wysiwyg-editor/plugins/album-image-editor/node';
import { ImageUploadingNode } from '$lib/components/modules/wysiwyg-editor/plugins/album-image-uploading/node';
import {
	insertBlockNodeToNext,
	selectBlockEnd
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
	return `${envPublic.PUBLIC_ORIGIN_IMAGE_CDN}/user-album/${albumImage.userId}/${albumImage.filePath}?ext=${albumImage.toExtension}&w=${albumImage.width}&h=${albumImage.height}&q=60`;
}

function insertImage(editor: LexicalEditor, albumImage: AlbumImageItem) {
	editor.update(() => {
		const selection = $getSelection();
		if (!$isRangeSelection(selection)) {
			return;
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
	});
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

export function registerImagePlugin(editor: LexicalEditor): () => void {
	const removeListener = mergeRegister(
		editor.registerCommand(
			INSERT_IMAGE_BLOCK_COMMAND,
			(imageItem) => {
				insertImage(editor, imageItem);
				return true;
			},
			COMMAND_PRIORITY_NORMAL
		),
		editor.registerCommand(
			CHANGE_IMAGE_BLOCK_COMMAND,
			(imageItem) => {
				return replaceByImage(editor, imageItem);
			},
			COMMAND_PRIORITY_NORMAL
		)
	);

	return removeListener;
}
