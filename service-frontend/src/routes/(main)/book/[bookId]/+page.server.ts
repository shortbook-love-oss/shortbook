import { error } from '@sveltejs/kit';
import { dbBookGet } from '$lib/model/book/get';
import { getBookCover, contentsToMarkdown } from '$lib/utilities/book';
import type { BookDetail } from '$lib/utilities/book';
import { guessNativeLangFromRequest } from '$lib/utilities/language';

export const load = async ({ request, params }) => {
	const { book, dbError } = await dbBookGet({ bookId: params.bookId });
	if (!book || !book.cover || dbError) {
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

	const bookPrologues = contentsToMarkdown(bookLang?.prologue ?? '');
	const bookContent = contentsToMarkdown(bookLang?.content ?? '');

	const bookCover = getBookCover({
		title: bookLang?.title ?? '',
		subtitle: bookLang?.subtitle ?? '',
		baseColorStart: book.cover.base_color_start,
		baseColorEnd: book.cover.base_color_end,
		baseColorDirection: book.cover.base_color_direction,
		titleFontSize: book.cover.title_font_size,
		titleAlign: book.cover.title_align,
		titleColor: book.cover.title_color,
		subtitleFontSize: book.cover.subtitle_font_size,
		subtitleAlign: book.cover.subtitle_align,
		subtitleColor: book.cover.subtitle_color,
		writerAlign: book.cover.writer_align,
		writerColor: book.cover.writer_color
	});
	const bookDetail: BookDetail = {
		...bookCover,
		id: book.id,
		userId: book.user_id,
		status: book.status,
		title: bookLang?.title ?? '',
		subtitle: bookLang?.subtitle ?? '',
		publishedAt: book.published_at,
		updatedAt: book.updated_at,
		keyName: profile?.key_name ?? '',
		penName: profileLang?.pen_name ?? '',
		image: book.user.image ?? '',
		prologues: bookPrologues,
		contents: bookContent,
		sales_message: bookLang?.sales_message ?? ''
	};

	return { bookDetail, requestLang };
};
