import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dbBookDeleteRequest } from '$lib/model/book/delete';
import { dbBookUpdateRequest } from '$lib/model/book/update';
import { dbBookGet } from '$lib/model/book/get';
import { getAuthUserId } from '$lib/utilities/server/crypto';
import { languageAndNotSelect } from '$lib/utilities/language';
import { getLangTagPathPart } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book-update';

export const load = async ({ cookies, params }) => {
	const userId = getAuthUserId(cookies);
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	const form = await superValidate(zod(schema));
	const langTags = languageAndNotSelect;

	const { book, dbError } = await dbBookGet({
		bookId: params.bookId,
		userId
	});
	if (dbError) {
		return error(500, { message: dbError.message });
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
	update: async ({ request, cookies, url, params }) => {
		const userId = getAuthUserId(cookies);
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
				message: 'Server error: Failed to update book.'
			});
		}

		redirect(303, getLangTagPathPart(url.pathname) + '/write');
	},

	delete: async ({ cookies, url, params }) => {
		const userId = getAuthUserId(cookies);
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const { dbError } = await dbBookDeleteRequest({
			bookId: params.bookId,
			userId
		});
		if (dbError) {
			return error(500, {
				message: 'Server error: Failed to delete book.'
			});
		}

		redirect(303, getLangTagPathPart(url.pathname) + '/write');
	}
};
