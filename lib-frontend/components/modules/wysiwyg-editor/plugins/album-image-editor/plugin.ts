import { mergeRegister } from '@lexical/utils';
import {
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

export const INSERT_IMAGE_COMMAND: LexicalCommand<AlbumImageItem[]> =
	createCommand('INSERT_IMAGE_COMMAND');

function insertImage(editor: LexicalEditor, albumImages: AlbumImageItem[]) {
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

		// Insert images after the block at the end of the selection
		const imageNodes = albumImages.map((image) => {
			return new ImageNode(
				image.id,
				`${envPublic.PUBLIC_ORIGIN_IMAGE_CDN}/user-album/${image.userId}/${image.filePath}?ext=${image.toExtension}&w=${image.width}&h=${image.height}&q=60`,
				image.alt,
				image.width,
				image.height
			);
		});
		selection.insertNodes(imageNodes);
	});
}

export function registerImagePlugin(editor: LexicalEditor): () => void {
	const removeListener = mergeRegister(
		editor.registerCommand(
			INSERT_IMAGE_COMMAND,
			(albumImages: AlbumImageItem[]) => {
				insertImage(editor, albumImages);
				return true;
			},
			COMMAND_PRIORITY_NORMAL
		)
	);

	return removeListener;
}
