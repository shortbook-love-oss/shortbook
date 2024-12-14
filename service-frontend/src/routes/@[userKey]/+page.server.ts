import { error } from '@sveltejs/kit';
import { env as envPublic } from '$env/dynamic/public';
import { contentsToMarkdown, getBookCover, type BookItem } from '$lib/utilities/book';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { dbBookList } from '$lib-backend/model/book/list';
import { dbUserGetByKeyHandle } from '$lib-backend/model/user/get-by-key-handle';

export const load = async ({ url, params, locals }) => {
	const signInUser = locals.signInUser;
	const requestLang = getLanguageTagFromUrl(url);

	const { user, dbError } = await dbUserGetByKeyHandle({ keyHandle: params.userKey });
	if (!user || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	if (user.image_src) {
		user.image_src = envPublic.PUBLIC_ORIGIN_IMAGE_CDN + user.image_src;
	}

	const { books, dbError: bookDbError } = await dbBookList({
		userId: user.id,
		statuses: [1],
		contentsLanguage: requestLang,
		isIncludeAdmin: signInUser?.id === user.id
	});
	if (!books || bookDbError) {
		return error(500, { message: bookDbError?.message ?? '' });
	}

	let userLang = user.languages.find((lang) => lang.language_tag === requestLang);
	if (!userLang && user.languages.length) {
		userLang = user.languages.at(0);
	}

	const bookList: BookItem[] = [];
	for (const book of books) {
		const bookRevision = book.revisions.at(0);
		const bookLang = bookRevision?.contents.at(0);
		if (!bookRevision?.cover || bookRevision.contents.length === 0 || !bookLang) {
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
			bookUrlSlug: bookRevision.url_slug,
			userKeyHandle: user.key_handle,
			penName: user.pen_name,
			userImage: user.image_src
		});
	}

	const userSelfIntro = await contentsToMarkdown(userLang?.self_introduction ?? '');

	return { bookList, requestLang, userSelfIntro };
};
