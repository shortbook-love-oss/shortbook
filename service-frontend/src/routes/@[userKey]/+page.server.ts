import { error } from '@sveltejs/kit';
import { env as envPublic } from '$env/dynamic/public';
import { type BookItem, contentsToMarkdown, getBookCover } from '$lib/utilities/book';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { dbBookList } from '$lib-backend/model/book/list';
import { dbUserGetByKeyHandle } from '$lib-backend/model/user/get-by-key-handle';

export const load = async ({ url, params }) => {
	const requestLang = getLanguageTagFromUrl(url);

	const { user, dbError } = await dbUserGetByKeyHandle({ keyHandle: params.userKey });
	if (!user || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	if (user.image_src) {
		user.image_src = envPublic.PUBLIC_ORIGIN_IMAGE_CDN + user.image_src;
	}

	const { books, dbError: bookDbError } = await dbBookList({ userId: user.id });
	if (!books || bookDbError) {
		return error(500, { message: bookDbError?.message ?? '' });
	}

	let userLang = user.languages.find((lang) => lang.target_language === requestLang);
	if (!userLang && user.languages.length) {
		userLang = user.languages[0];
	}

	const bookList: BookItem[] = [];
	for (const book of books) {
		let bookLang = book.languages.find((lang) => lang.target_language === requestLang);
		if (!bookLang && book.languages.length) {
			bookLang = book.languages[0];
		}
		if (!book.user || !userLang || !book.cover || !bookLang) {
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
			userKeyHandle: user.key_handle,
			penName: user.pen_name,
			userImage: user.image_src
		});
	}

	const userSelfIntro = await contentsToMarkdown(userLang?.self_introduction ?? '');

	return { bookList, requestLang, userSelfIntro };
};
