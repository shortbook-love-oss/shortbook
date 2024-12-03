import { error, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { initEditorState, type EditorState } from '$lib/components/modules/wysiwyg-editor/editor';
import { bookCreateUrlParam } from '$lib/utilities/book';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import { getLanguageTagFromUrl, setLanguageTagToPath } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book/draft-create';
import { dbBookRevisionList } from '$lib-backend/model/book/revision/list';
import { dbBookDelete } from '$lib-backend/model/book/delete';
import { dbBookGet } from '$lib-backend/model/book/get';

export const load = async ({ url, locals, params }) => {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}

	const form = await superValidate(zod(schema));

	let freeArea = initEditorState;
	let paidArea = initEditorState;
	let salesArea = initEditorState;

	let bookId = '';
	let bookStatus = 0;
	let nativeLanguage = getLanguageTagFromUrl(url);
	let updatedAt: Date | null = null;
	let initTitle = '';
	let initUrlSlug = '';
	let hasPublishedRevision = false;

	if (params.bookId !== bookCreateUrlParam) {
		const { book, bookRevision, dbError } = await dbBookGet({
			bookId: params.bookId,
			userId: signInUser.id
		});
		if (!book || !bookRevision || dbError) {
			return error(500, { message: dbError?.message ?? '' });
		}

		// If the latest version is a draft, check for exist published revision
		hasPublishedRevision = bookRevision.status === 1;
		if (!hasPublishedRevision) {
			const { revisions, dbError } = await dbBookRevisionList({ bookId: book.id });
			if (!revisions || dbError) {
				return error(500, { message: dbError?.message ?? '' });
			}
			hasPublishedRevision = revisions.some((revision) => {
				return revision.status === 1;
			});
		}

		form.data.title = bookRevision.title;
		form.data.subtitle = bookRevision.subtitle;
		freeArea = JSON.parse(bookRevision.free_area) as EditorState;
		paidArea = JSON.parse(bookRevision.paid_area) as EditorState;
		salesArea = JSON.parse(bookRevision.sales_area) as EditorState;

		bookId = book.id;
		bookStatus = bookRevision.status;
		nativeLanguage = bookRevision.native_language as AvailableLanguageTags;
		updatedAt = bookRevision.updated_at;
		initTitle = bookRevision.title;
		initUrlSlug = bookRevision.url_slug;
	}

	return {
		form,
		freeArea,
		paidArea,
		salesArea,
		bookId,
		bookStatus,
		nativeLanguage,
		updatedAt,
		initTitle,
		initUrlSlug,
		hasPublishedRevision
	};
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
