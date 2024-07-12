import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { AvailableLanguageTag } from '$lib/i18n/paraglide/runtime';
import { dbBookDeleteRequest } from '$lib/model/book/delete';
import { dbBookUpdateRequest } from '$lib/model/book/update';
import { dbBookGet } from '$lib/model/book/get';
import { dbUserProfileGet } from '$lib/model/user/profile/get';
import { getAuthUserId } from '$lib/utilities/server/crypto';
import { getBookCover } from '$lib/utilities/book';
import { languageAndNotSelect } from '$lib/utilities/language';
import { getLangTagPathPart } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book-update';

export const load = async ({ cookies, params }) => {
	const userId = getAuthUserId(cookies);
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	const form = await superValidate(zod(schema));
	const langTags = languageAndNotSelect;

	const { book, dbError } = await dbBookGet({
		bookId: params.bookId,
		userId
	});
	if (!book || !book.cover || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	let bookLang = book?.languages[0];

	const { profile, dbError: profileDbError } = await dbUserProfileGet({ userId });
	if (!profile || profileDbError) {
		return error(500, { message: profileDbError?.message ?? '' });
	}
	const penName = profile.languages[0]?.pen_name ?? '';

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
	for (const coverProp in bookCover) {
		const prop = coverProp as keyof typeof bookCover;
		form.data[prop] = bookCover[prop] as never;
	}
	form.data.nativeLanguage = (bookLang?.language_code ?? '') as AvailableLanguageTag;
	form.data.prologue = bookLang?.prologue ?? '';
	form.data.content = bookLang?.content ?? '';
	form.data.salesMessage = bookLang?.sales_message ?? '';

	const initTitle = form.data.title;
	const status = book?.status ?? 0;

	return { form, penName, langTags, status, initTitle };
};

export const actions = {
	update: async ({ request, cookies, url, params }) => {
		const userId = getAuthUserId(cookies);
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { book, dbError } = await dbBookUpdateRequest({
			bookId: params.bookId,
			userId,
			status: 1,
			...form.data
		});
		if (!book || dbError) {
			return error(500, { message: dbError?.message ?? '' });
		}

		redirect(303, `${getLangTagPathPart(url.pathname)}/book/${book.id}`);
	},

	delete: async ({ cookies, url, params }) => {
		const userId = getAuthUserId(cookies);
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const { dbError } = await dbBookDeleteRequest({
			bookId: params.bookId,
			userId
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		redirect(303, getLangTagPathPart(url.pathname) + '/write');
	}
};
