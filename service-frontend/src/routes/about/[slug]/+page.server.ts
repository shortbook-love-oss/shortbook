import { error } from '@sveltejs/kit';
import { env as envPublic } from '$env/dynamic/public';
import { getBookCover, type BookDetail } from '$lib/utilities/book';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { getBookByUrlSlug } from '$lib-backend/functions/service/book/get-by-url-slug';

export const load = async ({ url, params }) => {
	const requestLang = getLanguageTagFromUrl(url);

	const { book, bookRevision, bookLang, errorMessage } = await getBookByUrlSlug(
		'ShortBookAbout',
		params.slug,
		requestLang
	);
	if (errorMessage != undefined) {
		return error(500, { message: errorMessage });
	} else if (bookRevision?.cover == null) {
		return error(404, { message: 'Not found' });
	} else if (!book.is_admin) {
		return error(404, { message: 'Not found' });
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
	const bookDetail: BookDetail = {
		...bookCover,
		id: book.id,
		userId: book.user_id,
		status: bookRevision.status,
		buyPoint: 0,
		title: bookLang.title,
		subtitle: bookLang.subtitle,
		updatedAt: bookRevision.updated_at,
		bookUrlSlug: bookRevision.url_slug,
		userKeyHandle: book.user.key_handle,
		penName: book.user.pen_name,
		userImage: envPublic.PUBLIC_ORIGIN_IMAGE_CDN + book.user.image_src,
		freeArea: bookLang.free_area_html,
		paidArea: '',
		salesArea: '',
		isAdminBook: book.is_admin,
		isBookDeleted: book.deleted_at != null
	};

	return { bookDetail };
};
