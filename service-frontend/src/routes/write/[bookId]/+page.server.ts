import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
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

	const { book, dbError } = await dbBookGet({
		bookId: params.bookId,
		userId: signInUser.id,
		isIncludeDraft: true
	});
	if (!book || !book.cover || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}

	const title = form.data.title;
	const subtitle = form.data.subtitle;
	const content = form.data.content;
	const initTitle = form.data.title;

	const titleMaxLength = form.constraints?.title?.maxlength;
	const subtitleMaxLength = form.constraints?.subtitle?.maxlength;

	return { title, subtitle, content, initTitle, titleMaxLength, subtitleMaxLength };
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
