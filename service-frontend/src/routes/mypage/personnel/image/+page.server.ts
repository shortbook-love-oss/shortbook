import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { env } from '$env/dynamic/private';
import { dbUserProfileGet } from '$lib/model/user/profile/get';
import { dbUserProfileImageUpdate } from '$lib/model/user/update-profile-image';
import { getAuthUserId } from '$lib/utilities/server/crypto';
import { getGcsSignedUrl, uploadGcsBySignedUrl } from '$lib/utilities/server/file';
import { schema } from '$lib/validation/schema/profile-image-update';

export const load = async ({ cookies }) => {
	const form = await superValidate(zod(schema));

	const userId = getAuthUserId(cookies);
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
	default: async ({ request, cookies }) => {
		const userId = getAuthUserId(cookies);
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			message(form, 'There was an error. please check your selected image and resubmit.');
			return fail(400, { form });
		}
		const image = form.data.profileImage[0];

		// Upload image to Google Cloud Storage
		const uploadUrl = await getGcsSignedUrl(
			env.GCP_STORAGE_BUCKET_NAME as string,
			`profile-image/${userId}`,
			image.type,
			30
		);
		const uploaded = await uploadGcsBySignedUrl(image, uploadUrl);
		const isSuccessUpload = await uploaded
			.text()
			.then(() => true)
			.catch(() => false);
		if (!isSuccessUpload) {
			return error(500, { message: "Can't upload profile image. Please contact us." });
		}

		// Save image URL to DB
		const { dbError } = await dbUserProfileImageUpdate({
			userId: userId,
			image: `https://storage.googleapis.com/${env.GCP_STORAGE_BUCKET_NAME}/profile-image/${userId}`
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		return message(
			form,
			'Profile image updated successfully. The change will take up to 20 seconds.'
		);
	}
};
