import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dbBookUpdateRequest } from '$lib/model/book/update';
import { dbBookGet } from '$lib/model/book/get';
import { getUserId } from '$lib/utilities/cookie';
import { languageAndNotSelect } from '$lib/utilities/language';
import { getLangTagPathPart } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book-update';

export const load = async ({ cookies, params }) => {
	const form = await superValidate(zod(schema));
	const langTags = languageAndNotSelect;

	const userId = getUserId(cookies);
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	const { book, dbError } = await dbBookGet({ bookId: params.bookId });
	if (dbError) {
		return error(500, {
			message: 'Server error: Failed to get book.'
		});
	}
	let bookLang = book?.languages[0];

	form.data.title = bookLang?.title ?? '';
	form.data.nativeLanguage = bookLang?.language_code ?? '';
	form.data.introduction = bookLang?.introduction ?? '';
	form.data.content = bookLang?.content ?? '';
	form.data.salesMessage = bookLang?.sales_message ?? '';
	const status = book?.status ?? 0;

	return { form, status, langTags };
};

export const actions = {
	default: async ({ request, cookies, url, params }) => {
		const userId = getUserId(cookies);
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			return fail(400, { form });
		}

		const { dbError } = await dbBookUpdateRequest({
			bookId: params.bookId,
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
