import { error, redirect } from '@sveltejs/kit';
import { setLanguageTagToPath } from '$lib/utilities/url';
import { dbBookGet } from '$lib-backend/model/book/get';

export const load = async ({ url, params }) => {
	const { book, bookRevision, dbError } = await dbBookGet({
		bookId: params.bookId,
		statuses: [1],
		isIncludeDelete: true
	});
	if (!book || !bookRevision || dbError) {
		return error(404, { message: 'Not found' });
	}

	const redirectPath = setLanguageTagToPath(
		`/@${book.user.key_handle}/book/${bookRevision.url_slug}${url.search}`,
		url
	);
	redirect(301, redirectPath);
};
