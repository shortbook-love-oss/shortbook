import { error } from '@sveltejs/kit';
import { getBookCover, type MyBookItem } from '$lib/utilities/book';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { dbBookList } from '$lib-backend/model/book/list';

export const load = async ({ url, locals }) => {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}

	const { books, dbError } = await dbBookList({
		userId: signInUser.id,
		isIncludeDraft: true
	});
	if (!books || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	const requestLang = getLanguageTagFromUrl(url);

	const bookList: MyBookItem[] = [];
	for (const book of books) {
		const bookRevision = book.revisions[0];
		if (!bookRevision?.cover || bookRevision.contents.length === 0) {
			continue;
		}
		let bookLang = bookRevision.contents.find((lang) => lang.target_language === requestLang);
		if (!bookLang) {
			bookLang = bookRevision.contents[0];
		}
		if (!bookLang) {
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
			status: book.status,
			publishedAt: book.published_at,
			updatedAt: book.updated_at
		});
	}

	return { bookList, requestLang };
};
