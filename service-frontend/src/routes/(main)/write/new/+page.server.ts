import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dbBookCreate } from '$lib/model/book/create';
import { dbUserProfileGet } from '$lib/model/user/profile/get';
import { getBookCover } from '$lib/utilities/book';
import { type AvailableLanguageTags, languageAndNotSelect } from '$lib/utilities/language';
import { getLanguageTagFromUrl, setLanguageTagToPath } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book-update';

export const load = async ({ url, locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}
	const requestLang = getLanguageTagFromUrl(url);

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
	form.data.buyPoint = 200;

	return { form, penName, langTags };
};

export const actions = {
	default: async ({ request, url, locals }) => {
		const userId = locals.session?.user?.id;
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { book, dbError } = await dbBookCreate({
			userId,
			status: 1,
			...form.data
		});
		if (!book || dbError) {
			return error(500, { message: dbError?.message ?? '' });
		}

		redirect(303, setLanguageTagToPath(`/book/${book.id}`, url));
	}
};
