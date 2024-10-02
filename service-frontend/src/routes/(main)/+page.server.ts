import { error } from '@sveltejs/kit';
import { env as envPublic } from '$env/dynamic/public';
import { dbBookList } from '$lib-backend/model/book/list';
import { type BookItem, getBookCover } from '$lib/utilities/book';
import { getLanguageTagFromUrl } from '$lib/utilities/url';

export const load = async ({ url }) => {
	const { books, dbError } = await dbBookList({});
	if (dbError) {
		return error(500, { message: dbError.message });
	}
	const requestLang = getLanguageTagFromUrl(url);

	const bookList: BookItem[] = [];
	if (books) {
		for (const book of books) {
			let userLang = book.user.languages.find((lang) => lang.target_language === requestLang);
			if (!userLang && book.user.languages.length) {
				userLang = book.user.languages[0];
			}
			let bookLang = book.languages.find((lang) => lang.target_language === requestLang);
			if (!bookLang && book.languages.length) {
				bookLang = book.languages[0];
			}
			if (!userLang || !book.cover || !bookLang) {
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
				title: bookLang.title,
				subtitle: bookLang.subtitle,
				publishedAt: book.published_at,
				updatedAt: book.updated_at,
				bookUrlSlug: book.url_slug,
				userKeyHandle: book.user.key_handle,
				penName: book.user.pen_name,
				userImage: envPublic.PUBLIC_ORIGIN_IMAGE_CDN + book.user.image_src
			});
		}
	}

	return { bookList, requestLang };
};
