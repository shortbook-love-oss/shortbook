import { error, redirect } from '@sveltejs/kit';
import { dbBookGet } from '$lib-backend/model/book/get';
import { setLanguageTagToPath } from '$lib/utilities/url';

export const load = async ({ url, params }) => {
	const { book, dbError } = await dbBookGet({
		bookId: params.bookId,
		revision: 0,
		isIncludeDelete: true,
		isIncludeDraft: true
	});
	if (dbError || !book?.user) {
		return error(404, { message: 'Not found' });
	}

	redirect(
		301,
		setLanguageTagToPath(`/@${book.user.key_handle}/book/${book.url_slug}${url.search}`, url)
	);
};
