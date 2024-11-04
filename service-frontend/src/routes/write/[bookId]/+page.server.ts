import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { bookCreateUrlParam } from '$lib/utilities/book';
import { setLanguageTagToPath } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book/update';
import { isExistBookUrlSlug } from '$lib-backend/functions/service/write/edit-action';
import { dbBookDelete } from '$lib-backend/model/book/delete';
import { dbBookGet } from '$lib-backend/model/book/get';
import { dbBookUpdate } from '$lib-backend/model/book/update';

export const load = async ({ locals, params }) => {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}

	const form = await superValidate(zod(schema));

	let bookStatus = 0; // 0: Draft 1: Public 2: Fan club only
	let updatedAt: Date | null = null;

	if (params.bookId !== bookCreateUrlParam) {
		const { book, bookRevision, dbError } = await dbBookGet({
			bookId: params.bookId,
			userId: signInUser.id,
			revision: 0,
			isIncludeDraft: true
		});
		if (!book || !bookRevision || dbError) {
			return error(500, { message: dbError?.message ?? '' });
		}

		const bookLang = bookRevision.contents[0];
		form.data.title = bookLang.title;
		form.data.subtitle = bookLang.subtitle;
		form.data.content = bookLang.content;

		bookStatus = book.status;
		updatedAt = book.updated_at;
	}

	const initTitle = form.data.title;

	return { form, bookStatus, updatedAt, initTitle };
};

export const actions = {
	update: async ({ request, url, locals, params }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}
		const bookIdParam = params.bookId;

		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			const isExist = await isExistBookUrlSlug(signInUser.id, form.data.urlSlug, bookIdParam);
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

		const { book, dbError: dbBookUpdateError } = await dbBookUpdate({
			bookId: bookIdParam,
			revision: 0,
			userId: signInUser.id,
			status: 1,
			...form.data
		});
		if (!book || dbBookUpdateError) {
			return error(500, { message: dbBookUpdateError?.message ?? '' });
		}

		redirect(303, setLanguageTagToPath(`/write/${book.id}/publish`, url));
	},

	draft: async ({ request, url, locals, params }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { book, dbError: dbBookUpdateError } = await dbBookUpdate({
			bookId: params.bookId,
			revision: 0,
			userId: signInUser.id,
			status: 0,
			...form.data
		});
		if (!book || dbBookUpdateError) {
			return error(500, { message: dbBookUpdateError?.message ?? '' });
		}

		redirect(303, setLanguageTagToPath(`/write`, url));
	},

	delete: async ({ url, locals, params }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}

		const { dbError } = await dbBookDelete({
			bookId: params.bookId,
			userId: signInUser.id
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		redirect(303, setLanguageTagToPath('/write', url));
	}
};
