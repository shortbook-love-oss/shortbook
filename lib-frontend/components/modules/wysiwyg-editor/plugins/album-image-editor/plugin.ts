import { mergeRegister, $insertNodeToNearestRoot } from '@lexical/utils';
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
import { ImageNode } from '$lib/components/modules/wysiwyg-editor/plugins/album-image-editor/node';
import type { AlbumImageItem } from '$lib/utilities/album';

export interface AlbumImageUploadingItem {
	nodeKey: string;
	imageName: string;
}

export interface AlbumImageNodeItem {
	nodeKey: string;
	albumImage: AlbumImageItem;
}

export const INSERT_IMAGE_BLOCK_COMMAND: LexicalCommand<AlbumImageUploadingItem[]> = createCommand(
	'INSERT_IMAGE_BLOCK_COMMAND'
);
export const CHANGE_IMAGE_BLOCK_COMMAND: LexicalCommand<AlbumImageNodeItem> = createCommand(
	'CHANGE_IMAGE_BLOCK_COMMAND'
);

function insertImagePlaceholders(
	editor: LexicalEditor,
	imageUploadings: AlbumImageUploadingItem[]
) {
	editor.update(() => {
		const selection = $getSelection();
		if (!$isRangeSelection(selection)) {
			return;
		}
		if (selection.anchor.isBefore(selection.focus)) {
			selection.focus.getNode().getTopLevelElement()?.selectEnd();
		} else {
			selection.anchor.getNode().getTopLevelElement()?.selectEnd();
		}

		// Insert images after selecting block
		// Paragraph nodes are auto-added between images, but this is acceptable
		const insertedNodes = imageUploadings.map(() => {
			const insertNode = new ImageNode('', '', '', 0, 0);
			return $insertNodeToNearestRoot(insertNode);
		});

		// The caller holds the key of the added node
		for (let i = 0; i < imageUploadings.length; i++) {
			imageUploadings[i].nodeKey = insertedNodes[i].getKey();
		}
	});
}

function replaceByImage(editor: LexicalEditor, imageItem: AlbumImageNodeItem) {
	// editor.update(() => {
	const imagePlaceNode = $getNodeByKey(imageItem.nodeKey);
	if (!(imagePlaceNode instanceof ImageNode)) {
		return false;
	}

	const albumImage = imageItem.albumImage;
	imagePlaceNode.setImageData(
		albumImage.id,
		`${envPublic.PUBLIC_ORIGIN_IMAGE_CDN}/user-album/${albumImage.userId}/${albumImage.filePath}?ext=${albumImage.toExtension}&w=${albumImage.width}&h=${albumImage.height}&q=60`,
		albumImage.alt,
		albumImage.width,
		albumImage.height
	);

	return true;
}

export function registerImagePlugin(editor: LexicalEditor): () => void {
	const removeListener = mergeRegister(
		editor.registerCommand(
			INSERT_IMAGE_BLOCK_COMMAND,
			(imageUploadings) => {
				insertImagePlaceholders(editor, imageUploadings);
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
