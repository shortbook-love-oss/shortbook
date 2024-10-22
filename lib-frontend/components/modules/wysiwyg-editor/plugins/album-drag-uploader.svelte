<script lang="ts">
	import type { LexicalEditor } from 'lexical';
	import {
		INSERT_IMAGE_BLOCK_COMMAND,
		CHANGE_IMAGE_BLOCK_COMMAND,
		type AlbumImageUploadingItem
	} from '$lib/components/modules/wysiwyg-editor/plugins/album-image-editor/plugin';
	import type { AlbumImageItem, AlbumImageUploadResult } from '$lib/utilities/album';
	import { imageMIMEextension, uploadFiles } from '$lib/utilities/file';
	import { isValidFilesSize } from '$lib/validation/rules/file';
	import UploadDragAndDrop from '$lib/components/layouts/upload-drag-and-drop.svelte';

	type Props = {
		editor: LexicalEditor;
	};
	let { editor }: Props = $props();

	function onUploadStart(images: FileList) {
		const imageUploadings: AlbumImageUploadingItem[] = [];
		for (let i = 0; i < images.length; i++) {
			imageUploadings.push({
				nodeKey: '',
				imageName: images[i].name
			});
		}
		editor.dispatchCommand(INSERT_IMAGE_BLOCK_COMMAND, imageUploadings);

		return imageUploadings;
	}

	function onUploadSuccess(
		uploadingNodes: AlbumImageUploadingItem[],
		albumImages: AlbumImageItem[]
	) {
		for (let i = 0; i < uploadingNodes.length; i++) {
			editor.dispatchCommand(CHANGE_IMAGE_BLOCK_COMMAND, {
				nodeKey: uploadingNodes[i].nodeKey,
				albumImage: albumImages[i]
			});
		}
	}

	function onUploadError(error: Error) {}

	// Upload images to user album
	async function uploadToAlbum(images: FileList) {
		const allowMimeTypes = Object.keys(imageMIMEextension);
		const validFiles = new DataTransfer();
		for (let i = 0; i < images.length; i++) {
			if (allowMimeTypes.includes(images[i].type)) {
				validFiles.items.add(images[i]);
			}
		}
		if (validFiles.items.length === 0) {
			onUploadError(new Error('Please select at least one file.'));
			return;
		}
		if (!isValidFilesSize(validFiles.files)) {
			onUploadError(new Error('Cannot upload files over 28 MB'));
			return;
		}

		const imageUploadings = onUploadStart(validFiles.files);
		const result = await uploadFiles<AlbumImageUploadResult>(
			'/api/album/upload',
			validFiles.files,
			'images'
		);
		if (result instanceof Error) {
			onUploadError(result);
		} else {
			onUploadSuccess(imageUploadings, result.fileResults);
		}
	}
</script>

<UploadDragAndDrop text="Attach image" onDrop={uploadToAlbum} />
