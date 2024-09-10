import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';
import { dbUserAlbumImageCreate } from '$lib-backend/model/user/album/image-create';
import { dbUserAlbumImageList } from '$lib-backend/model/user/album/image-list';
import { getRandom } from '$lib/utilities/crypto';
import { imageMIMEextension } from '$lib/utilities/file';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/user/album-update';
import {
	getExtensionForAll,
	type AllowedFromExtension
} from '$lib-backend/utilities/infrastructure/image';
import { uploadFile } from '$lib-backend/utilities/file';
import { getActualImageData } from '$lib-backend/utilities/image';

export const load = async ({ url, locals }) => {
	const form = await superValidate(zod(schema));

	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}
	const requestLang = getLanguageTagFromUrl(url);

	const { albumImages, dbError } = await dbUserAlbumImageList({
		userId,
		languageCode: requestLang
	});
	if (!albumImages || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}

	const albumImageList = albumImages.map((image) => {
		let imageLang = image.languages.find(lang => {
			return lang.language_code === requestLang;
		});
		if (!imageLang) {
			imageLang = image.languages[0];
		}
		const fromExtension = imageMIMEextension[image.property?.mime_type ?? ''] ?? '';
		return {
			id: image.id,
			name: image.name,
			filePath: `${envPublic.PUBLIC_ORIGIN_IMAGE_CDN}/user-album/${userId}/${image.file_path}`,
			width: image.property?.width ?? 0,
			height: image.property?.height ?? 0,
			toExtension: getExtensionForAll(fromExtension as AllowedFromExtension | ''),
			alt: imageLang?.alt ?? ''
		};
	})

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

		const imageResults = await Promise.allSettled(
			form.data.images.map(async (image) => {
				return getActualImageData(new Uint8Array(await image.arrayBuffer()));
			})
		);
		const isImageFulfilled = imageResults.some((image) => {
			return image.status === 'fulfilled' && !image.value.errorMessage;
		});
		if (!isImageFulfilled) {
			const reasons = (imageResults as PromiseRejectedResult[])
				.map((result, i) => `${i + 1}—${result.reason}`)
				.filter(Boolean);
			return error(500, {
				message: `Can't upload image. Please contact us. Reason: ${reasons.join(', ')}`
			});
		}

		const uploadResults = await Promise.allSettled(
			imageResults.map(async (image) => {
				if (image.status !== 'fulfilled') {
					throw new Error(image.reason);
				} else if (!image.value.image || image.value.errorMessage) {
					throw new Error(image.value.errorMessage);
				}

				const saveFileName = `album-${getRandom(20)}.${image.value.extension}`;
				const { isSuccessUpload, checksum, error: uploadFileError } = await uploadFile(
					image.value.image,
					image.value.mimeType,
					env.AWS_DEFAULT_REGION,
					env.AWS_BUCKET_IMAGE_USER_ALBUM,
					`${userId}/${saveFileName}`
				);
				if (uploadFileError || !isSuccessUpload) {
					throw new Error('Error when upload new image.');
				}

				const { dbError } = await dbUserAlbumImageCreate({
					userId: userId,
					name: saveFileName,
					filePath: saveFileName,
					width: image.value.width,
					height: image.value.height,
					mimeType: image.value.mimeType,
					checksum
				});
				if (dbError) {
					throw new Error(dbError.message);
				}
			})
		);
		if (uploadResults.some((image) => image.status !== 'fulfilled')) {
			const reasons = (uploadResults as PromiseRejectedResult[])
				.map((result, i) => `${i + 1}—${result.reason}`)
				.filter(Boolean);
			return error(500, {
				message: `Can't upload image. Please contact us. Reason: ${reasons.join(', ')}`
			});
		}

		return message(form, 'Image uploaded successfully.');
	}
};
