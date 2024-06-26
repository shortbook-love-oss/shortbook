import { error } from '@sveltejs/kit';
import { dbBookList } from '$lib/model/book/list';
import { getUserId } from '$lib/utilities/cookie';
import { guessNativeLangFromRequest } from '$lib/utilities/language';

interface ResponseBookList {
	id: string;
	status: number;
	title: string;
	publishedAt: Date;
	updatedAt: Date;
}

export const load = async ({ request, cookies }) => {
	const userId = getUserId(cookies);
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	const { books, dbError } = await dbBookList({ userId });
	if (dbError) {
		return error(500, {
			message: 'Server error: Failed to get books.'
		});
	}
	const requestLang = guessNativeLangFromRequest(request);

	const bookList: ResponseBookList[] =
		books?.map((book) => {
			let langInfo = book.languages.find((lang) => lang.language_code === requestLang);
			if (!langInfo && book.languages.length) {
				langInfo = book.languages[0];
			}
			return {
				id: book.id,
				status: book.status,
				title: langInfo?.title ?? '',
				publishedAt: book.published_at,
				updatedAt: book.updated_at
			};
		}) ?? [];

	return { bookList, requestLang };
};
