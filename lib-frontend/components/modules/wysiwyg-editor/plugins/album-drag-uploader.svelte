<script lang="ts">
	import type { LexicalEditor } from 'lexical';
	import type { AlbumImageItem, AlbumImageUploadResult } from '$lib/utilities/album';
	import { imageMIMEextension, uploadFiles } from '$lib/utilities/file';
	import { isValidFilesSize } from '$lib/validation/rules/file';
	import UploadDragAndDrop from '$lib/components/layouts/upload-drag-and-drop.svelte';

	type Props = {
		editor: LexicalEditor;
	};
	let { editor }: Props = $props();

	function onUploadStart(images: FileList) {}

	function onUploadSuccess(albumFiles: AlbumImageItem[]) {}

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

		onUploadStart(validFiles.files);
		const result = await uploadFiles<AlbumImageUploadResult>(
			'/api/album/upload',
			validFiles.files,
			'images'
		);
		if (result instanceof Error) {
			onUploadError(result);
		} else {
			onUploadSuccess(result.fileResults);
		}
	}
</script>

<UploadDragAndDrop text="Attach image" onDrop={uploadToAlbum} />
