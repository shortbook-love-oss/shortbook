import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { env } from '$env/dynamic/private';
import { dbUserProfileImageUpdate } from '$lib-backend/model/user/update-profile-image';
import { getRandom } from '$lib/utilities/crypto';
import { schema } from '$lib/validation/schema/user/album-update';
import { uploadFile } from '$lib-backend/utilities/file';
import { imageSecureCheck } from '$lib-backend/utilities/image';

export const load = async ({ locals }) => {
	const form = await superValidate(zod(schema));

	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	return { form };
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
				return imageSecureCheck(new Uint8Array(await image.arrayBuffer()));
			})
		);
		const isImageFulfilled = imageResults.some((image) => {
			return image.status === 'fulfilled' && !image.value.errorMessage;
		});
		if (!isImageFulfilled) {
			const reasons = (imageResults as PromiseRejectedResult[]).map((result, i) => `${i + 1}—${result.reason}`).filter(Boolean);
			return error(500, {
				message: `Can't upload image. Please contact us. Reason: ${reasons.join(', ')}`
			});
		}

		const uploadResults = await Promise.allSettled(
			(imageResults).map(async (image) => {
				if (image.status !== 'fulfilled') {
					throw new Error(image.reason);
				} else if (!image.value.image || image.value.errorMessage) {
					throw new Error(image.value.errorMessage);
				}

				const savePath = `${userId}/album-${getRandom(20)}.${image.value.extension}`;
				const { isSuccessUpload, error: uploadFileError } = await uploadFile(
					image.value.image,
					image.value.mimeType,
					env.AWS_DEFAULT_REGION,
					env.AWS_BUCKET_IMAGE_USER_ALBUM,
					savePath
				);
				if (uploadFileError || !isSuccessUpload) {
					throw new Error('Error when upload new image.');
				}

				// Save image URL to DB
				const { dbError } = await dbUserProfileImageUpdate({
					userId: userId,
					image: '/user-album/' + savePath
				});
				if (dbError) {
					throw new Error(dbError.message);
				}
			})
		);
		if (uploadResults.some((image) => image.status !== 'fulfilled')) {
			const reasons = (uploadResults as PromiseRejectedResult[]).map((result, i) => `${i + 1}—${result.reason}`).filter(Boolean);
			return error(500, {
				message: `Can't upload image. Please contact us. Reason: ${reasons.join(', ')}`
			});
		}

		return message(form, 'Image uploaded successfully.');
	}
};
