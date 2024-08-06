import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';
import { dbUserProfileGet } from '$lib/model/user/profile/get';
import { dbUserProfileImageUpdate } from '$lib/model/user/update-profile-image';
import { fileUpload } from '$lib/utilities/server/file';
import { imageMIMEextension } from '$lib/utilities/file';
import { schema } from '$lib/validation/schema/profile-image-update';

export const load = async ({ locals }) => {
	const form = await superValidate(zod(schema));

	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	const { profile, dbError } = await dbUserProfileGet({ userId });
	if (dbError) {
		return error(500, { message: dbError.message });
	}

	const profileLangs = profile?.languages[0];
	const penName = profileLangs?.pen_name ?? '';

	return { form, penName };
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
		const isSuccessUpload = await fileUpload(
			env.AWS_BUCKET_PROFILE_IMAGE,
			`${userId}/profile-image-${cacheRefresh}.${extension}`,
			image
		);
		if (!isSuccessUpload) {
			return error(500, { message: "Can't upload profile image. Please contact us." });
		}

		// Save image URL to DB
		const { dbError } = await dbUserProfileImageUpdate({
			userId: userId,
			image: `${envPublic.PUBLIC_ORIGIN_PROFILE_IMAGE}/${userId}/profile-image-${cacheRefresh}.${extension}`
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		return message(form, 'Profile image updated successfully.');
	}
};
