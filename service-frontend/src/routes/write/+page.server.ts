import { error } from '@sveltejs/kit';
import { getBookCover, type MyBookItem } from '$lib/utilities/book';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { dbBookList } from '$lib-backend/model/book/list';
import type { AvailableLanguageTags } from '$lib/utilities/language.js';

export const load = async ({ url, locals }) => {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}
	const requestLang = getLanguageTagFromUrl(url);

	const { books, dbError } = await dbBookList({
		userId: signInUser.id,
		isIncludeAdmin: true
	});
	if (!books || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}

	const bookList: MyBookItem[] = [];
	for (const book of books) {
		const bookRevision = book.revisions.at(0);
		if (!bookRevision?.cover) {
			continue;
		}

		const bookCover = getBookCover({
			title: bookRevision.title,
			subtitle: bookRevision.subtitle,
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
			updatedAt: bookRevision.updated_at,
			hasPublishedRevision: book.revisions.some((rev) => rev.status === 1),
			translateLanguages: bookRevision.contents.map(
				(lang) => lang.language_tag as AvailableLanguageTags
			),
			isAdmin: book.is_admin
		});
	}

	return { bookList, requestLang };
};
