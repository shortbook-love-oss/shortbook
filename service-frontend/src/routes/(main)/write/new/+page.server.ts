import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dbBookCreate } from '$lib-backend/model/book/create';
import { dbUserProfileGet } from '$lib-backend/model/user/profile/get';
import { getBookCover } from '$lib/utilities/book';
import { type AvailableLanguageTags, languageAndNotSelect } from '$lib/utilities/language';
import { getLanguageTagFromUrl, setLanguageTagToPath } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book-update';
import { isExistBookKeyName } from '$lib-backend/functions/service/write/edit-action';
import { editLoad } from '$lib-backend/functions/service/write/edit-load';

export const load = async ({ url, locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}
	const requestLang = getLanguageTagFromUrl(url);

	const form = await superValidate(zod(schema));
	const langTags = languageAndNotSelect;

	const { profile, userKeyName, penName, selectedCurrencyKey, currencyRateIndex } =
		await editLoad(userId);

	const bookCover = getBookCover({});
	for (const coverProp in bookCover) {
		const prop = coverProp as keyof typeof bookCover;
		form.data[prop] = bookCover[prop] as never;
	}
	form.data.nativeLanguage = (profile.native_language || requestLang) as AvailableLanguageTags;
	form.data.prologue = '';
	form.data.content = '';
	form.data.salesMessage = '';
	form.data.keyName = '';
	form.data.buyPoint = 200;

	return { form, userKeyName, penName, langTags, selectedCurrencyKey, currencyRateIndex };
};

export const actions = {
	publish: async ({ request, url, locals }) => {
		const userId = locals.session?.user?.id;
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			const isExist = await isExistBookKeyName(userId, form.data.keyName, '');
			if (isExist) {
				form.valid = false;
				form.errors.keyName = form.errors.keyName ?? [];
				form.errors.keyName.push('There is a book with the same URL.');
			}
		}
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { book, dbError: dbBookCreateError } = await dbBookCreate({
			userId,
			status: 1,
			...form.data
		});
		if (!book || dbBookCreateError) {
			return error(500, { message: dbBookCreateError?.message ?? '' });
		}

		const { profile, dbError: dbProfileGetError } = await dbUserProfileGet({ userId });
		if (!profile || dbProfileGetError) {
			return error(500, { message: dbProfileGetError?.message ?? '' });
		}

		redirect(303, setLanguageTagToPath(`/@${profile.key_name}/book/${book.key_name}`, url));
	},

	draft: async ({ request, url, locals }) => {
		const userId = locals.session?.user?.id;
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			const isExist = await isExistBookKeyName(userId, form.data.keyName, '');
			if (isExist) {
				form.valid = false;
				form.errors.keyName = form.errors.keyName ?? [];
				form.errors.keyName.push('There is a book with the same URL.');
			}
		}
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { book, dbError: dbBookCreateError } = await dbBookCreate({
			userId,
			status: 0,
			...form.data
		});
		if (!book || dbBookCreateError) {
			return error(500, { message: dbBookCreateError?.message ?? '' });
		}

		redirect(303, setLanguageTagToPath(`/write`, url));
	}
};
