import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';
import type { AlbumImageItem } from '$lib/components/service/mypage/album/album';
import { arrayToSquads } from '$lib/utilities/array';
import { getRandom } from '$lib/utilities/crypto';
import { imageMIMEextension } from '$lib/utilities/file';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/user/album/image-create';
import { schema as schemaEdit } from '$lib/validation/schema/user/album/image-update';
import { dbUserAlbumImageCreate } from '$lib-backend/model/user/album/image-create';
import { dbUserAlbumImageList } from '$lib-backend/model/user/album/image-list';
import {
	getExtensionForAll,
	type AllowedFromExtension
} from '$lib-backend/utilities/infrastructure/image';
import { uploadFile } from '$lib-backend/utilities/file';
import { getActualImageData, type ActualImageDataSuccess } from '$lib-backend/utilities/image';

export const load = async ({ url, locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	const requestLang = getLanguageTagFromUrl(url);
	const form = await superValidate(zod(schema));

	const { albumImages, dbError } = await dbUserAlbumImageList({
		userId,
		languageCode: requestLang
	});
	if (!albumImages || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}

	const albumImageList = await Promise.all<AlbumImageItem>(
		albumImages.map(async (image) => {
			const editForm = await superValidate(zod(schemaEdit), { id: getRandom(15) });
			editForm.data.name = image.name;
			editForm.data.alt = image.alt;
			editForm.data.languageInImage = image.language_in_image;
			editForm.data.place = image.place;
			editForm.data.licenseUrl = image.license_url;
			editForm.data.creditNotice = image.credit_notice;
			editForm.data.isSensitive = image.is_sensitive;
			editForm.data.isAi = image.is_ai;
			const fromExtension = imageMIMEextension[image.property?.mime_type ?? ''] ?? '';

			return {
				editForm,
				id: image.id,
				name: image.name,
				alt: image.alt,
				languageInImage: image.language_in_image as AvailableLanguageTags | '',
				filePath: `${envPublic.PUBLIC_ORIGIN_IMAGE_CDN}/user-album/${userId}/${image.property?.file_path}`,
				byteLength: image.property?.byte_length ?? 0,
				width: image.property?.width ?? 0,
				height: image.property?.height ?? 0,
				toExtension: getExtensionForAll(fromExtension as AllowedFromExtension | '')
			};
		})
	);

	return { form, albumImageList };
};

export const actions = {
	default: async ({ request, locals }) => {
		const userId = locals.session?.user?.id;
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			message(form, 'There was an error. please check your selected image and resubmit.');
			return fail(400, { form });
		}

		type ImageResultSuccess = PromiseFulfilledResult<ActualImageDataSuccess>;
		const imageResults = await Promise.allSettled(
			form.data.images.map(async (file) => {
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
			return error(500, {
				message: `Can't upload image. Please contact us. Reason: ${checkRejectReasons.join(', ')}`
			});
		}

		const imageFIleNames = form.data.images.map((file) => file.name);

		// Split imageResults into groups of 10
		// Prevent saving too many files or modifying DB records at the same time
		const imageResultSquads = arrayToSquads<ImageResultSuccess>(
			imageResults as ImageResultSuccess[],
			10
		);

		const uploadResultSquads: PromiseSettledResult<void>[] = [];
		for (const imageResults of imageResultSquads) {
			const uploadResults = await Promise.allSettled(
				imageResults.map(async (imageResult, i) => {
					const saveFilePath = `album-${getRandom(24)}`;
					const fileName = imageFIleNames[i] ?? saveFilePath;
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

					const { dbError } = await dbUserAlbumImageCreate({
						userId: userId,
						name: fileName,
						filePath: saveFilePath,
						byteLength: imageResult.value.byteLength,
						width: imageResult.value.width,
						height: imageResult.value.height,
						mimeType: imageResult.value.mimeType,
						checksum
					});
					if (dbError) {
						throw new Error(dbError.message);
					}
				})
			);

			uploadResultSquads.push(...uploadResults);
		}
		const uploadRejectReasons: string[] = [];
		uploadResultSquads.forEach((result, i) => {
			if (result.status === 'rejected') {
				uploadRejectReasons.push(`${i + 1}—${result.reason}`);
			}
		});
		if (uploadRejectReasons.length) {
			return error(500, {
				message: `Can't upload image. Please contact us. Reason: ${uploadRejectReasons.join(', ')}`
			});
		}

		return message(form, 'Image uploaded successfully.');
	}
};
