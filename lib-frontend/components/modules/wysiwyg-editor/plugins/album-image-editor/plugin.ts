import { mergeRegister } from '@lexical/utils';
import {
	$getNodeByKey,
	COMMAND_PRIORITY_NORMAL,
	createCommand,
	type LexicalCommand,
	type LexicalEditor
} from 'lexical';
import { env as envPublic } from '$env/dynamic/public';
import { $createImageNode } from '$lib/components/modules/wysiwyg-editor/plugins/album-image-editor/node';
import { ImageUploadingNode } from '$lib/components/modules/wysiwyg-editor/plugins/album-image-uploading/node';
import type { AlbumImageItem } from '$lib/utilities/album';

export interface AlbumImageNodeItem {
	nodeKey: string;
	albumImage: AlbumImageItem;
}

export const CHANGE_IMAGE_BLOCK_COMMAND: LexicalCommand<AlbumImageNodeItem> = createCommand(
	'CHANGE_IMAGE_BLOCK_COMMAND'
);

function replaceByImage(editor: LexicalEditor, imageItem: AlbumImageNodeItem) {
	const imageUploaderNode = $getNodeByKey(imageItem.nodeKey);
	if (!(imageUploaderNode instanceof ImageUploadingNode)) {
		return false;
	}

	// First, cache the image by CDN
	// By doing so, switch quickly to image node
	const albumImage = imageItem.albumImage;
	const imageSrc = `${envPublic.PUBLIC_ORIGIN_IMAGE_CDN}/user-album/${albumImage.userId}/${albumImage.filePath}?ext=${albumImage.toExtension}&w=${albumImage.width}&h=${albumImage.height}&q=60`;
	const imgCacher = document.createElement('img');
	imgCacher.src = imageSrc;
	imgCacher.onload = () => {
		editor.update(
			() => {
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
			CHANGE_IMAGE_BLOCK_COMMAND,
			(imageItem) => {
				return replaceByImage(editor, imageItem);
			},
			COMMAND_PRIORITY_NORMAL
		)
	);

	return removeListener;
}
