<script lang="ts">
	import { $getNodeByKey as getNodeByKey, type LexicalEditor } from 'lexical';
	import { CHANGE_IMAGE_BLOCK_COMMAND } from '$lib/components/modules/wysiwyg-editor/plugins/album-image-editor/plugin';
	import { ImageUploadingNode } from '$lib/components/modules/wysiwyg-editor/plugins/album-image-uploading/node';
	import {
		INSERT_IMAGE_UPLOADER_BLOCK_COMMAND,
		type AlbumImageUploadedNode,
		type AlbumImageUploading
	} from '$lib/components/modules/wysiwyg-editor/plugins/album-image-uploading/plugin';
	import type { AlbumImageItem, AlbumImageUploadResult } from '$lib/utilities/album';
	import { imageMIMEextension, uploadFiles } from '$lib/utilities/file';
	import { isValidFilesSize } from '$lib/validation/rules/file';
	import UploadDragAndDrop from '$lib/components/layouts/upload-drag-and-drop.svelte';

	type Props = {
		editor: LexicalEditor;
	};
	let { editor }: Props = $props();

	function onUploadStart(images: FileList) {
		const uploadingImages: AlbumImageUploading[] = [];
		const uploadedImageNodes: AlbumImageUploadedNode[] = [];
		for (let i = 0; i < images.length; i++) {
			const dataUrl = URL.createObjectURL(images[i]);
			uploadingImages.push({
				fileName: images[i].name,
				dataUrl
			});
		}
		editor.dispatchCommand(INSERT_IMAGE_UPLOADER_BLOCK_COMMAND, {
			uploading: uploadingImages,
			uploaded: uploadedImageNodes
		});

		return { uploadingImages, uploadedImageNodes };
	}

	async function onUploadSuccess(
		albumImages: AlbumImageItem[],
		uploadingItems: AlbumImageUploading[],
		uploadedImageNodes: AlbumImageUploadedNode[]
	) {
		uploadingItems.forEach((uploading) => {
			URL.revokeObjectURL(uploading.dataUrl);
		});
		albumImages.forEach((albumImage, i) => {
			editor.dispatchCommand(CHANGE_IMAGE_BLOCK_COMMAND, {
				nodeKey: uploadedImageNodes[i].nodeKey,
				albumImage
			});
		});
	}

	function onUploadError(
		error: Error,
		uploadingItems: AlbumImageUploading[],
		uploadedImageNodes: AlbumImageUploadedNode[]
	) {
		console.error(error);
		uploadingItems.forEach((uploading) => {
			URL.revokeObjectURL(uploading.dataUrl);
		});
		uploadedImageNodes.forEach((uploaded) => {
			const node = getNodeByKey(uploaded.nodeKey);
			if (node instanceof ImageUploadingNode) {
				node.remove();
			}
		});
	}

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
			onUploadError(new Error('Please select at least one file.'), [], []);
			return;
		}
		if (!isValidFilesSize(validFiles.files)) {
			onUploadError(new Error('Cannot upload files over 28 MB'), [], []);
			return;
		}

		const { uploadingImages, uploadedImageNodes } = onUploadStart(validFiles.files);
		const result = await uploadFiles<AlbumImageUploadResult>(
			'/api/album/upload',
			validFiles.files,
			'images'
		);
		if (result instanceof Error) {
			onUploadError(result, uploadingImages, uploadedImageNodes);
		} else {
			onUploadSuccess(result.fileResults, uploadingImages, uploadedImageNodes);
		}
	}
</script>

<UploadDragAndDrop text="Attach image" onDrop={uploadToAlbum} />
