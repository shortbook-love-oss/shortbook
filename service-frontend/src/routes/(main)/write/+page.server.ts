import { error } from '@sveltejs/kit';
import { dbBookList } from '$lib/model/book/list';
import { getAuthUserId } from '$lib/utilities/server/crypto';
import type { BookItem } from '$lib/utilities/book';
import { guessNativeLangFromRequest } from '$lib/utilities/language';

export const load = async ({ request, cookies }) => {
	const userId = getAuthUserId(cookies);
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	const { books, dbError } = await dbBookList({ userId });
	if (dbError) {
		return error(500, { message: dbError.message });
	}
	const requestLang = guessNativeLangFromRequest(request);

	const bookList: BookItem[] =
		books?.map((book) => {
			let langInfo = book.languages.find((lang) => lang.language_code === requestLang);
			if (!langInfo && book.languages.length) {
				langInfo = book.languages[0];
			}
			return {
				id: book.id,
				status: book.status,
				title: langInfo?.title ?? '',
				subtitle: langInfo?.subtitle ?? '',
				publishedAt: book.published_at,
				updatedAt: book.updated_at
			};
		}) ?? [];

	return { bookList, requestLang };
};
