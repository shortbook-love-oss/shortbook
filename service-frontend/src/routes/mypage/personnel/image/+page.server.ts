import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { env } from '$env/dynamic/private';
import { schema } from '$lib/validation/schema/user/profile/image-update';
import { deleteImageCache } from '$lib-backend/utilities/cache';
import { deleteFiles, uploadFile } from '$lib-backend/utilities/file';
import { dbUserProfileImageUpdate } from '$lib-backend/model/user/update-profile-image';
import { getActualImageData } from '$lib-backend/utilities/image';

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

		const profileImage = new Uint8Array(await form.data.profileImage[0].arrayBuffer());
		const { mimeType, errorMessage } = await getActualImageData(profileImage);
		if (!profileImage || !mimeType || errorMessage) {
			message(form, errorMessage ?? '');
			return fail(400, { form });
		}

		// Delete image cache
		await deleteImageCache(env.AWS_CONTENT_DISTRIBUTION_ID_IMAGE_CDN, `/profile/${userId}/*`);

		// Delete image file in CDN
		// Path format is /profile/${userId}/profile.${extension}/${someoption-w-h-q...}/profile.${extension}
		// So delete /profile/${userId}/*
		const { error: cdnDeleteError } = await deleteFiles(
			env.AWS_DEFAULT_REGION,
			`${env.AWS_BUCKET_IMAGE_PROFILE}-cdn`,
			userId
		);
		if (cdnDeleteError) {
			console.error('Error when delete old converted profile-image.');
			return error(500, { message: "Can't upload profile image. Please contact us." });
		}

		// Upload image to Amazon S3
		const savePath = `${userId}/shortbook-profile`;
		const { isSuccessUpload, error: uploadFileError } = await uploadFile(
			profileImage,
			mimeType,
			env.AWS_DEFAULT_REGION,
			env.AWS_BUCKET_IMAGE_PROFILE,
			savePath
		);
		if (uploadFileError || !isSuccessUpload) {
			console.error('Error when upload new profile-image.');
			return error(500, { message: "Can't upload profile image. Please contact us." });
		}

		// Save image URL to DB
		const { dbError } = await dbUserProfileImageUpdate({
			userId: userId,
			image: '/profile/' + savePath
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		return message(form, 'Profile image updated successfully.');
	}
};
