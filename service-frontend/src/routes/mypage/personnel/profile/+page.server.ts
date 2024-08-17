import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { AvailableLanguageTag } from '$lib/i18n/paraglide/runtime';
import { dbUserProfileGet } from '$lib/model/user/profile/get';
import { dbUserProfileUpdate } from '$lib/model/user/profile/update';
import { dbUserGetByKeyName } from '$lib/model/user/get-by-key-name';
import { languageAndNotSelect } from '$lib/utilities/language';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/profile-update';

export const load = async ({ url, locals }) => {
	const requestLang = getLanguageTagFromUrl(url);
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

	const langTags = languageAndNotSelect;

	form.data.keyName = profile?.key_name ?? '';
	form.data.nativeLanguage = (profile?.native_language || requestLang) as AvailableLanguageTag;
	form.data.penName = profileLangs?.pen_name ?? '';
	form.data.headline = profileLangs?.headline ?? '';
	form.data.selfIntroduction = profileLangs?.self_introduction ?? '';
	const initPenName = form.data.penName;

	return { form, langTags, initPenName };
};

export const actions = {
	default: async ({ request, locals }) => {
		const userId = locals.session?.user?.id;
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			// If already use key-name, show error message near the input
			const { user, dbError } = await dbUserGetByKeyName({ keyName: form.data.keyName });
			if (dbError) {
				return error(500, { message: dbError.message });
			}
			if (user && user.id !== userId) {
				form.valid = false;
				form.errors.keyName = form.errors.keyName ?? [];
				form.errors.keyName.push('This ID is in use by another user');
			}
		}
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { dbError } = await dbUserProfileUpdate({
			userId,
			...form.data
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		return message(form, 'Profile updated successfully.');
	}
};
