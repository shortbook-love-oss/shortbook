import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { env } from '$env/dynamic/private';
import { dbUserProfileImageUpdate } from '$lib-backend/model/user/update-profile-image';
import { imageMIMEextension } from '$lib/utilities/file';
import { schema } from '$lib/validation/schema/profile-image-update';
import { uploadFile } from '$lib-backend/utilities/infrastructure/file';

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
		const image = form.data.profileImage[0];
		const cacheRefresh = Date.now().toString(36);
		const extension = imageMIMEextension[image.type as keyof typeof imageMIMEextension];

		// Upload image to Amazon S3
		const savePath = `${userId}/${cacheRefresh}.${extension}`;
		const { isSuccessUpload, error: uploadFileError } = await uploadFile(
			new Uint8Array(await image.arrayBuffer()),
			image.type,
			env.AWS_DEFAULT_REGION,
			env.AWS_BUCKET_IMAGE_PROFILE,
			savePath,
			undefined
		);
		if (uploadFileError || !isSuccessUpload) {
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
