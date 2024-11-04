import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { initEditorState, type EditorState } from '$lib/components/modules/wysiwyg-editor/editor';
import { bookCreateUrlParam } from '$lib/utilities/book';
import { setLanguageTagToPath } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book/draft-create';
import { dbBookDelete } from '$lib-backend/model/book/delete';
import { dbBookGet } from '$lib-backend/model/book/get';

export const load = async ({ locals, params }) => {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}

	const form = await superValidate(zod(schema));

	let prologue = initEditorState;
	let content = initEditorState;
	let bookId = '';
	let bookStatus = 0; // 0: Draft 1: Public 2: Fan club only
	let updatedAt: Date | null = null;
	let initTitle = '';
	let initUrlSlug = '';

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
		prologue = JSON.parse(bookLang.prologue) as EditorState;
		content = JSON.parse(bookLang.content) as EditorState;

		bookId = book.id;
		bookStatus = book.status;
		updatedAt = book.updated_at;
		initTitle = bookLang.title;
		initUrlSlug = book.url_slug;
	}

	return { form, prologue, content, bookId, bookStatus, updatedAt, initTitle, initUrlSlug };
};

export const actions = {
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
