import { error } from '@sveltejs/kit';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { dbBookGet } from '$lib-backend/model/book/get';

export const load = async ({ url }) => {
	const requestLang = getLanguageTagFromUrl(url);

	// Get a book even if it's a draft, and filter it later
	const {
		book,
		bookRevision,
		dbError: dbBookGetError
	} = await dbBookGet({
		bookUrlSlug: 'term',
		userKeyHandle: 'shortbook',
		statuses: [1],
		contentsLanguage: requestLang
	});
	if (dbBookGetError) {
		return error(500, { message: dbBookGetError.message });
	} else if (!book || !bookRevision?.cover) {
		return error(500, { message: `Can't find the book.` });
	}
};
