import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dbUserProfileGet } from '$lib/model/user/profile/get';
import { dbUserProfileUpdate } from '$lib/model/user/profile/update';
import { dbUserGetByKeyName } from '$lib/model/user/get-by-key-name';
import { getAuthUserId } from '$lib/utilities/server/crypto';
import { guessNativeLangFromRequest, languageAndNotSelect } from '$lib/utilities/language';
import { schema } from '$lib/validation/schema/profile-update';

export const load = async ({ request, cookies }) => {
	const form = await superValidate(zod(schema));
	const langTags = languageAndNotSelect;

	const userId = getAuthUserId(cookies);
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	const { profile, dbError } = await dbUserProfileGet({ userId });
	if (dbError) {
		return error(500, {
			message: 'Server error: Failed to get user.'
		});
	}
	const profileLangs = profile?.languages[0];
	const requestLang = guessNativeLangFromRequest(request);

	form.data.keyName = profile?.key_name ?? '';
	form.data.nativeLanguage = profile?.native_language || requestLang;
	form.data.penName = profileLangs?.pen_name ?? '';
	form.data.headline = profileLangs?.headline ?? '';
	form.data.selfIntroduction = profileLangs?.self_introduction ?? '';

	return { form, langTags };
};

export const actions = {
	default: async ({ request, cookies }) => {
		const userId = getAuthUserId(cookies);
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			// If already use key-name, show error message near the input
			const { user, dbError } = await dbUserGetByKeyName({ keyName: form.data.keyName });
			if (dbError) {
				return error(500, {
					message: 'Server error: Failed to get user.'
				});
			}
			if (user && user.id !== userId) {
				form.valid = false;
				form.errors.keyName = form.errors.keyName ?? [];
				form.errors.keyName.push('This ID is in use by another user');
			}
		}
		if (!form.valid) {
			return fail(400, { form });
		}

		const { dbError } = await dbUserProfileUpdate({
			userId,
			...form.data
		});
		if (dbError) {
			return error(500, {
				message: 'Server error: Failed to update user.'
			});
		}

		return message(form, 'Profile updated successfully.');
	}
};
