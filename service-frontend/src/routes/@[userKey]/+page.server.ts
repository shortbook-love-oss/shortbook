import { error } from '@sveltejs/kit';
import { env as envPublic } from '$env/dynamic/public';
import { dbBookList } from '$lib-backend/model/book/list';
import { dbUserGetByKeyName } from '$lib-backend/model/user/get-by-key-name';
import { type BookItem, contentsToMarkdown, getBookCover } from '$lib/utilities/book';
import { getLanguageTagFromUrl } from '$lib/utilities/url';

export const load = async ({ url, params }) => {
	const requestLang = getLanguageTagFromUrl(url);

	const { user, dbError } = await dbUserGetByKeyName({ keyName: params.userKey });
	if (!user || !user.profiles || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	if (user.image) {
		user.image = envPublic.PUBLIC_ORIGIN_IMAGE_CDN + user.image;
	}

	const { books, dbError: bookDbError } = await dbBookList({ userId: user.id });
	if (!books || bookDbError) {
		return error(500, { message: bookDbError?.message ?? '' });
	}

	const profile = user.profiles;
	let profileLang = profile?.languages.find((lang) => lang.language_code === requestLang);
	if (!profileLang && profile?.languages.length) {
		profileLang = profile.languages[0];
	}

	const bookList: BookItem[] = [];
	for (const book of books) {
		let bookLang = book.languages.find((lang) => lang.language_code === requestLang);
		if (!bookLang && book.languages.length) {
			bookLang = book.languages[0];
		}
		if (!book.user || !profile || !profileLang || !book.cover || !bookLang) {
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
			bookKeyName: book.key_name,
			userKeyName: profile.key_name,
			penName: profileLang.pen_name,
			userImage: user.image ?? ''
		});
	}

	const userSelfIntro = await contentsToMarkdown(profileLang?.self_introduction ?? '');

	return { bookList, requestLang, userSelfIntro };
};
