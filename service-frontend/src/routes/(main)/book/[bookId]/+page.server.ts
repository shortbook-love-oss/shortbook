import { error } from '@sveltejs/kit';
import { dbBookGet } from '$lib/model/book/get';
import type { BookDetail } from '$lib/utilities/book';
import { guessNativeLangFromRequest } from '$lib/utilities/language';

export const load = async ({ request, params }) => {
	const { book, dbError } = await dbBookGet({ bookId: params.bookId });
	if (!book || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	const requestLang = guessNativeLangFromRequest(request);

	let bookLang = book.languages.find((lang) => lang.language_code === requestLang);
	if (!bookLang && book.languages.length) {
		bookLang = book.languages[0];
	}
	const profile = book.user.profiles;
	let profileLang = profile?.languages.find((lang) => lang.language_code === requestLang);
	if (!profileLang && profile?.languages.length) {
		profileLang = profile.languages[0];
	}

	const bookDetail: BookDetail = {
		id: book.id,
		status: book.status,
		title: bookLang?.title ?? '',
		subtitle: bookLang?.subtitle ?? '',
		publishedAt: book.published_at,
		updatedAt: book.updated_at,
		keyName: profile?.key_name ?? '',
		penName: profileLang?.pen_name ?? '',
		image: book.user.image ?? '',
		prologue: bookLang?.prologue ?? '',
		content: bookLang?.content ?? '',
		sales_message: bookLang?.sales_message ?? ''
	};

	return { bookDetail, requestLang };
};
