import { error } from '@sveltejs/kit';
import { env as envPublic } from '$env/dynamic/public';
import { getBookCover, type BookItem } from '$lib/utilities/book';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { dbBookList } from '$lib-backend/model/book/list';

export const load = async ({ url }) => {
	const { books, dbError } = await dbBookList({});
	if (!books || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	const requestLang = getLanguageTagFromUrl(url);

	const bookList: BookItem[] = [];
	for (const book of books) {
		let userLang = book.user.languages.find((lang) => lang.target_language === requestLang);
		if (!userLang && book.user.languages.length) {
			userLang = book.user.languages[0];
		}
		const bookRevision = book.revisions[0];
		if (book.revisions.length === 0 || bookRevision.contents.length === 0 || !bookRevision.cover) {
			continue;
		}
		let bookLang = bookRevision.contents.find((lang) => lang.target_language === requestLang);
		if (!bookLang) {
			bookLang = bookRevision.contents[0];
		}
		if (!userLang || !bookLang) {
			continue;
		}

		const bookCover = getBookCover({
			title: bookLang.title,
			subtitle: bookLang.subtitle,
			baseColorStart: bookRevision.cover.base_color_start,
			baseColorEnd: bookRevision.cover.base_color_end,
			baseColorDirection: bookRevision.cover.base_color_direction,
			titleFontSize: bookRevision.cover.title_font_size,
			titleAlign: bookRevision.cover.title_align,
			titleColor: bookRevision.cover.title_color,
			subtitleFontSize: bookRevision.cover.subtitle_font_size,
			subtitleAlign: bookRevision.cover.subtitle_align,
			subtitleColor: bookRevision.cover.subtitle_color,
			writerAlign: bookRevision.cover.writer_align,
			writerColor: bookRevision.cover.writer_color
		});
		bookList.push({
			...bookCover,
			id: book.id,
			userId: book.user_id,
			status: bookRevision.status,
			title: bookLang.title,
			subtitle: bookLang.subtitle,
			updatedAt: bookRevision.updated_at,
			bookUrlSlug: book.url_slug,
			userKeyHandle: book.user.key_handle,
			penName: book.user.pen_name,
			userImage: envPublic.PUBLIC_ORIGIN_IMAGE_CDN + book.user.image_src
		});
	}

	return { bookList, requestLang };
};
