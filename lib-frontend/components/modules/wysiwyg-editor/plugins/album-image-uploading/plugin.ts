import { mergeRegister, $insertNodeToNearestRoot } from '@lexical/utils';
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_NORMAL,
	createCommand,
	type LexicalCommand,
	type LexicalEditor
} from 'lexical';
import { ImageUploadingNode } from '$lib/components/modules/wysiwyg-editor/plugins/album-image-uploading/node';

export interface AlbumImageUploading {
	fileName: string;
	dataUrl: string;
}

export interface AlbumImageUploadedNode {
	nodeKey: string;
}

export const INSERT_IMAGE_UPLOADER_BLOCK_COMMAND: LexicalCommand<{
	uploading: AlbumImageUploading[];
	uploaded: AlbumImageUploadedNode[];
}> = createCommand('INSERT_IMAGE_UPLOADER_BLOCK_COMMAND');

function insertImagePlaceholders(
	editor: LexicalEditor,
	uploadingImages: AlbumImageUploading[],
	uploadedImageNodes: AlbumImageUploadedNode[]
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
		const insertedNodes = uploadingImages.map((image) => {
			const insertNode = new ImageUploadingNode(image.fileName, image.dataUrl);
			const insertedNode = $insertNodeToNearestRoot(insertNode);
			return insertedNode;
		});

		// The caller holds the key of the added node
		for (let i = 0; i < uploadingImages.length; i++) {
			uploadedImageNodes.push({ nodeKey: insertedNodes[i].getKey() });
		}
	});
}

export function registerImageUploaderPlugin(editor: LexicalEditor): () => void {
	const removeListener = mergeRegister(
		editor.registerCommand(
			INSERT_IMAGE_UPLOADER_BLOCK_COMMAND,
			(imageUpload) => {
				insertImagePlaceholders(editor, imageUpload.uploading, imageUpload.uploaded);
				return true;
			},
			COMMAND_PRIORITY_NORMAL
		)
	);

	return removeListener;
}
