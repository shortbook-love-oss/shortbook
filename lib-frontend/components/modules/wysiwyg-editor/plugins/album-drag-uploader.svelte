<script lang="ts">
	import type { LexicalEditor } from 'lexical';
	import { imageMIMEextension, uploadFiles } from '$lib/utilities/file';
	import { isValidFilesSize } from '$lib/validation/rules/file';
	import UploadDragAndDrop from '$lib/components/layouts/upload-drag-and-drop.svelte';

	type Props = {
		editor: LexicalEditor;
	};
	let { editor }: Props = $props();

	function onUploadStart(files: FileList) {}

	function onUploadSuccess() {}

	function onUploadError(error: Error) {}

	// Upload files to user album
	async function uploadToAlbum(files: FileList) {
		const allowMimeTypes = Object.keys(imageMIMEextension);
		const validFiles = new DataTransfer();
		for (let i = 0; i < files.length; i++) {
			if (allowMimeTypes.includes(files[i].type)) {
				validFiles.items.add(files[i]);
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
		const result = await uploadFiles('/mypage/asset/album', validFiles.files, 'images');
		if (result instanceof Error) {
			onUploadError(result);
		} else {
			onUploadSuccess();
		}
	}
</script>

<UploadDragAndDrop text="Attach image" onDrop={uploadToAlbum} />
