import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { AvailableLanguageTag } from '$i18n/output/runtime';
import { languageSelect } from '$lib/utilities/language';
import { schema } from '$lib/validation/schema/user/profile/update';
import { dbUserProfileGet } from '$lib-backend/model/user/profile/get';
import { dbUserProfileUpdate } from '$lib-backend/model/user/profile/update';
import { dbUserGetByKeyHandle } from '$lib-backend/model/user/get-by-key-handle';

export const load = async ({ locals }) => {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}

	const form = await superValidate(zod(schema));

	const { user, dbError } = await dbUserProfileGet({ userId: signInUser.id });
	if (!user || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	const userLangs = user.languages[0];

	form.data.keyHandle = user.key_handle;
	form.data.nativeLanguage = user.native_language as AvailableLanguageTag;
	form.data.penName = user.pen_name;
	form.data.headline = userLangs?.headline ?? '';
	form.data.selfIntroduction = userLangs?.self_introduction ?? '';
	const initPenName = form.data.penName;

	return { form, languageSelect, initPenName };
};

export const actions = {
	default: async ({ request, locals }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			// If already use key-name, show error message near the input
			const { user, dbError } = await dbUserGetByKeyHandle({ keyHandle: form.data.keyHandle });
			if (dbError) {
				return error(500, { message: dbError.message });
			}
			if (user && user.id !== signInUser.id) {
				form.valid = false;
				form.errors.keyHandle = form.errors.keyHandle ?? [];
				form.errors.keyHandle.push('This ID is in use by another user');
			}
		}
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { dbError } = await dbUserProfileUpdate({
			...form.data,
			userId: signInUser.id
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		return message(form, 'Profile updated successfully.');
	}
};
