import { error } from '@sveltejs/kit';
import { dbBookList } from '$lib/model/book/list';
import { dbUserProfileGet } from '$lib/model/user/profile/get';
import { getAuthUserId } from '$lib/utilities/server/crypto';
import { getBookCover } from '$lib/utilities/book';
import type { MyBookItem } from '$lib/utilities/book';
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

	const { profile, dbError: profileDbError } = await dbUserProfileGet({ userId });
	if (!profile || profileDbError) {
		return error(500, { message: profileDbError?.message ?? '' });
	}
	const penName = profile.languages[0]?.pen_name ?? '';

	const bookList: MyBookItem[] = [];
	if (books) {
		for (const book of books) {
			let bookLang = book.languages.find((lang) => lang.language_code === requestLang);
			if (!bookLang && book.languages.length) {
				bookLang = book.languages[0];
			}
			if (!book.cover || !bookLang) {
				continue;
			}
			const bookCover = getBookCover({
				title: bookLang.title,
				subtitle: bookLang.subtitle,
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
			bookList.push({
				...bookCover,
				id: book.id,
				userId: book.user_id,
				status: book.status,
				publishedAt: book.published_at,
				updatedAt: book.updated_at
			});
		}
	}

	return { bookList, penName, requestLang };
};
