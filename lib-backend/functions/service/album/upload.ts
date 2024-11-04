import { env } from '$env/dynamic/private';
import type { AlbumImageItem, AlbumImageUploadResult } from '$lib/utilities/album';
import { arrayToSquads } from '$lib/utilities/array';
import { getRandom } from '$lib/utilities/crypto';
import { imageMIMEextension } from '$lib/utilities/file';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import { dbUserAlbumImageCreate } from '$lib-backend/model/user/album/image-create';
import { getExtensionForAll } from '$lib-backend/utilities/infrastructure/image';
import { uploadFile } from '$lib-backend/utilities/file';
import { getActualImageData, type ActualImageDataSuccess } from '$lib-backend/utilities/image';

type UploadToAlbumResult =
	| (AlbumImageUploadResult & { errorMessage?: never })
	| (Partial<Record<keyof AlbumImageUploadResult, never>> & { errorMessage: string });

export async function uploadToAlbum(files: File[], userId: string): Promise<UploadToAlbumResult> {
	type ImageResultSuccess = PromiseFulfilledResult<ActualImageDataSuccess>;
	const imageResults = await Promise.allSettled(
		files.map(async (file) => {
			return getActualImageData(new Uint8Array(await file.arrayBuffer()));
		})
	);
	const checkRejectReasons: string[] = [];
	imageResults.forEach((result, i) => {
		if (result.status === 'rejected') {
			checkRejectReasons.push(`${i + 1}—${result.reason}`);
		} else if (result.value.errorMessage) {
			checkRejectReasons.push(`${i + 1}—${result.value.errorMessage}`);
		}
	});
	if (checkRejectReasons.length) {
		return {
			errorMessage: `Can't upload image. Please contact us. Reason: ${checkRejectReasons.join(', ')}`
		};
	}

	const imageFileNames = files.map((file) => file.name);

	// Split imageResults into groups of 10
	// Prevent saving too many files or modifying DB records at the same time
	const imageResultSquads = arrayToSquads<ImageResultSuccess>(
		imageResults as ImageResultSuccess[],
		10
	);

	const uploadResults: PromiseSettledResult<AlbumImageItem>[] = [];
	for (const imageResults of imageResultSquads) {
		const uploadResultsSquad = await Promise.allSettled(
			imageResults.map(async (imageResult, i) => {
				const saveFilePath = `album-${getRandom(24)}`;
				const fileName = imageFileNames[i] ?? saveFilePath;
				const {
					isSuccessUpload,
					checksum,
					error: uploadFileError
				} = await uploadFile(
					imageResult.value.image,
					imageResult.value.mimeType,
					env.AWS_DEFAULT_REGION,
					env.AWS_BUCKET_IMAGE_USER_ALBUM,
					`${userId}/${saveFilePath}`
				);
				if (uploadFileError || !isSuccessUpload) {
					throw new Error('Error when upload new image.');
				}

				const { albumImage, dbError } = await dbUserAlbumImageCreate({
					userId,
					name: fileName,
					filePath: saveFilePath,
					byteLength: imageResult.value.byteLength,
					width: imageResult.value.width,
					height: imageResult.value.height,
					mimeType: imageResult.value.mimeType,
					checksum
				});
				if (!albumImage || dbError) {
					throw new Error(dbError?.message ?? '');
				}

				return {
					id: albumImage.id,
					userId,
					name: albumImage.name,
					alt: albumImage.alt,
					languageInImage: albumImage.language_in_image as AvailableLanguageTags | '',
					filePath: saveFilePath,
					byteLength: imageResult.value.byteLength,
					width: imageResult.value.width,
					height: imageResult.value.height,
					toExtension: getExtensionForAll(imageMIMEextension[imageResult.value.mimeType])
				};
			})
		);

		uploadResults.push(...uploadResultsSquad);
	}
	const uploadRejectReasons: string[] = [];
	uploadResults.forEach((result, i) => {
		if (result.status === 'rejected') {
			uploadRejectReasons.push(`${i + 1}—${result.reason}`);
		}
	});
	if (uploadRejectReasons.length) {
		return {
			errorMessage: `Can't upload image. Please contact us. Reason: ${uploadRejectReasons.join(', ')}`
		};
	}

	return {
		fileResults: (uploadResults as PromiseFulfilledResult<AlbumImageItem>[]).map(
			(result) => result.value
		)
	};
}
