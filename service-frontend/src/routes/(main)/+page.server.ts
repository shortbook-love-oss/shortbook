import { error } from '@sveltejs/kit';
import { dbBookList } from '$lib/model/book/list';
import type { BookItem } from '$lib/utilities/book';
import { guessNativeLangFromRequest } from '$lib/utilities/language';

export const load = async ({ request }) => {
	const { books, dbError } = await dbBookList({});
	if (dbError) {
		return error(500, { message: dbError.message });
	}
	const requestLang = guessNativeLangFromRequest(request);

	const bookList: BookItem[] =
		books?.map((book) => {
			let bookLang = book.languages.find((lang) => lang.language_code === requestLang);
			if (!bookLang && book.languages.length) {
				bookLang = book.languages[0];
			}
			const profile = book.user.profiles;
			let profileLang = profile?.languages.find((lang) => lang.language_code === requestLang);
			if (!profileLang && profile?.languages.length) {
				profileLang = profile.languages[0];
			}

			return {
				id: book.id,
				status: book.status,
				title: bookLang?.title ?? '',
				subtitle: bookLang?.subtitle ?? '',
				publishedAt: book.published_at,
				updatedAt: book.updated_at,
				keyName: profile?.key_name ?? '',
				penName: profileLang?.pen_name ?? '',
				image: book.user.image ?? ''
			};
		}) ?? [];

	return { bookList, requestLang };
};
