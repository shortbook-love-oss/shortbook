import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dbBookCreateRequest } from '$lib/model/book/create';
import { dbUserProfileGet } from '$lib/model/user/profile/get';
import { getAuthUserId } from '$lib/utilities/server/crypto';
import { getBookCover } from '$lib/utilities/book';
import { guessNativeLangFromRequest, languageAndNotSelect } from '$lib/utilities/language';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import { getLangTagPathPart } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book-update';

export const load = async ({ request, cookies }) => {
	const userId = getAuthUserId(cookies);
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}
	const requestLang = guessNativeLangFromRequest(request);

	const form = await superValidate(zod(schema));
	const langTags = languageAndNotSelect;

	const { profile, dbError } = await dbUserProfileGet({ userId });
	if (!profile || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	const penName = profile.languages[0]?.pen_name ?? '';

	const bookCover = getBookCover({});
	for (const coverProp in bookCover) {
		const prop = coverProp as keyof typeof bookCover;
		form.data[prop] = bookCover[prop] as never;
	}
	form.data.nativeLanguage = (profile.native_language || requestLang) as AvailableLanguageTags;
	form.data.prologue = '';
	form.data.content = '';
	form.data.salesMessage = '';

	return { form, penName, langTags };
};

export const actions = {
	default: async ({ request, cookies, url }) => {
		const userId = getAuthUserId(cookies);
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { book, dbError } = await dbBookCreateRequest({
			userId,
			status: 1,
			...form.data
		});
		if (!book || dbError) {
			return error(500, { message: dbError?.message ?? '' });
		}

		redirect(303, `${getLangTagPathPart(url.pathname)}/book/${book.id}`);
	}
};
