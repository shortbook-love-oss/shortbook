import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dbBookCreateRequest } from '$lib/model/book/create';
import { dbUserProfileGet } from '$lib/model/user/profile/get';
import { getAuthUserId } from '$lib/utilities/server/crypto';
import { guessNativeLangFromRequest, languageAndNotSelect } from '$lib/utilities/language';
import { getLangTagPathPart } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book-update';

export const load = async ({ request, cookies }) => {
	const userId = getAuthUserId(cookies);
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	const form = await superValidate(zod(schema));
	const langTags = languageAndNotSelect;

	const { profile, dbError } = await dbUserProfileGet({ userId });
	if (dbError) {
		return error(500, {
			message: 'Server error: Failed to get user.'
		});
	}
	const requestLang = guessNativeLangFromRequest(request);

	form.data.title = '';
	form.data.nativeLanguage = profile?.native_language || requestLang;
	form.data.introduction = '';
	form.data.content = '';
	form.data.salesMessage = 'Read this! Will be helpful to you!';
	const status = 0;

	return { form, status, langTags };
};

export const actions = {
	default: async ({ request, cookies, url }) => {
		const userId = getAuthUserId(cookies);
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { dbError } = await dbBookCreateRequest({
			userId,
			status: 1,
			...form.data
		});
		if (dbError) {
			return error(500, {
				message: 'Server error: Failed to update user.'
			});
		}

		redirect(303, getLangTagPathPart(url.pathname) + '/write');
	}
};
