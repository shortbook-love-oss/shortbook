import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { getBookCover } from '$lib/utilities/book';
import { languageAndNotSelect } from '$lib/utilities/language';
import { setLanguageTagToPath } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book/update';
import { isExistBookUrlSlug } from '$lib-backend/functions/service/write/edit-action';
import { editLoad } from '$lib-backend/functions/service/write/edit-load';
import { dbBookCreate } from '$lib-backend/model/book/create';

export const load = async ({ locals }) => {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}

	const form = await superValidate(zod(schema));
	const langTags = languageAndNotSelect;

	const { userCurrencyCode, currencyRateIndex } = await editLoad(signInUser);

	const bookCover = getBookCover({});
	for (const coverProp in bookCover) {
		const prop = coverProp as keyof typeof bookCover;
		form.data[prop] = bookCover[prop] as never;
	}
	form.data.targetLanguage = signInUser.nativeLanguage;
	form.data.prologue = '';
	form.data.content = '';
	form.data.salesMessage = '';
	form.data.urlSlug = '';
	form.data.buyPoint = 200;

	return { form, langTags, userCurrencyCode, currencyRateIndex };
};

export const actions = {
	publish: async ({ request, url, locals }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			const isExist = await isExistBookUrlSlug(signInUser.id, form.data.urlSlug, '');
			if (isExist) {
				form.valid = false;
				form.errors.urlSlug = form.errors.urlSlug ?? [];
				form.errors.urlSlug.push('There is a book with the same URL.');
			}
		}
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { book, dbError: dbBookCreateError } = await dbBookCreate({
			userId: signInUser.id,
			status: 1,
			...form.data
		});
		if (!book || dbBookCreateError) {
			return error(500, { message: dbBookCreateError?.message ?? '' });
		}

		redirect(303, setLanguageTagToPath(`/@${signInUser.keyHandle}/book/${book.url_slug}`, url));
	},

	draft: async ({ request, url, locals }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			const isExist = await isExistBookUrlSlug(signInUser.id, form.data.urlSlug, '');
			if (isExist) {
				form.valid = false;
				form.errors.urlSlug = form.errors.urlSlug ?? [];
				form.errors.urlSlug.push('There is a book with the same URL.');
			}
		}
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { book, dbError: dbBookCreateError } = await dbBookCreate({
			userId: signInUser.id,
			status: 0,
			...form.data
		});
		if (!book || dbBookCreateError) {
			return error(500, { message: dbBookCreateError?.message ?? '' });
		}

		redirect(303, setLanguageTagToPath(`/write`, url));
	}
};
