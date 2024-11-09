import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { AvailableLanguageTag } from '$i18n/output/runtime';
import { getBookCover } from '$lib/utilities/book';
import { languageSelect } from '$lib/utilities/language';
import { getLanguageTagFromUrl, setLanguageTagToPath } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book/update';
import { validateOnlyVisibleChar } from '$lib/validation/rules/string';
import { isExistBookUrlSlug } from '$lib-backend/functions/service/write/edit-action';
import { editLoad } from '$lib-backend/functions/service/write/edit-load';
import { dbBookDelete } from '$lib-backend/model/book/delete';
import { dbBookGet } from '$lib-backend/model/book/get';
import { dbBookUpdate } from '$lib-backend/model/book/update';
import { dbBookBuyList } from '$lib-backend/model/book-buy/list';

export const load = async ({ url, locals, params }) => {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}
	const requestLang = getLanguageTagFromUrl(url);

	const form = await superValidate(zod(schema));
	const langTags = languageSelect;

	const { book, bookRevision, dbError } = await dbBookGet({
		bookId: params.bookId,
		userId: signInUser.id
	});
	if (dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	if (!book || !bookRevision?.cover || bookRevision.contents.length === 0) {
		return error(500, { message: `Can't find book. Book ID=${params.bookId}` });
	}
	let bookLang = bookRevision.contents.find((lang) => lang.target_language === requestLang);
	if (!bookLang) {
		bookLang = bookRevision.contents[0];
	}
	if (!validateOnlyVisibleChar(bookLang.title)) {
		redirect(303, `/write/${book.id}`);
	}

	const { userCurrencyCode, currencyRateIndex } = await editLoad(signInUser);

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
	for (const coverProp in bookCover) {
		const prop = coverProp as keyof typeof bookCover;
		if (prop !== 'title' && prop !== 'subtitle') {
			form.data[prop] = bookCover[prop] as never;
		}
	}
	form.data.targetLanguage = bookLang.target_language as AvailableLanguageTag;
	form.data.urlSlug = bookRevision.url_slug;
	form.data.buyPoint = bookRevision.buy_point;

	const initTitle = bookLang.title;
	const initSubtitle = bookLang.subtitle;
	const status = bookRevision.status;

	return {
		form,
		langTags,
		initTitle,
		initSubtitle,
		status,
		userCurrencyCode,
		currencyRateIndex
	};
};

export const actions = {
	update: async ({ request, url, locals, params }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}
		const requestLang = getLanguageTagFromUrl(url);

		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			const isExist = await isExistBookUrlSlug(signInUser.id, form.data.urlSlug, params.bookId);
			if (isExist) {
				form.valid = false;
				form.errors.urlSlug = form.errors.urlSlug ?? [];
				form.errors.urlSlug.push('There is a book with the same URL.');
			}
		}
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { bookRevision, dbError: dbBookGetError } = await dbBookGet({
			bookId: params.bookId,
			userId: signInUser.id
		});
		if (!bookRevision || dbBookGetError) {
			return error(500, { message: dbBookGetError?.message ?? '' });
		}
		let bookLang = bookRevision.contents.find((lang) => lang.target_language === requestLang);
		if (!bookLang) {
			bookLang = bookRevision.contents[0];
		}
		if (!bookLang) {
			return error(500, { message: `Failed to get book contents. Book ID=${params.bookId}` });
		}

		const { book, dbError: dbBookUpdateError } = await dbBookUpdate({
			bookId: params.bookId,
			userId: signInUser.id,
			status: 1,
			...form.data,
			title: bookLang.title,
			subtitle: bookLang.subtitle,
			freeArea: bookLang.free_area,
			isEmptyFreeArea: bookLang.is_empty_free_area,
			paidArea: bookLang.paid_area,
			isEmptyPaidArea: bookLang.is_empty_paid_area,
			salesArea: bookLang.sales_area,
			isEmptySalesArea: bookLang.is_empty_sales_area
		});
		if (!book || dbBookUpdateError) {
			return error(500, { message: dbBookUpdateError?.message ?? '' });
		}

		redirect(303, setLanguageTagToPath(`/@${signInUser.keyHandle}/book/${form.data.urlSlug}`, url));
	},

	draft: async ({ request, url, locals, params }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}
		const requestLang = getLanguageTagFromUrl(url);

		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			const { bookBuys, dbError: dbBuyListError } = await dbBookBuyList({ bookId: params.bookId });
			if (!bookBuys || dbBuyListError) {
				return error(500, { message: dbBuyListError?.message ?? '' });
			}
			if (bookBuys.length) {
				message(form, "Can't revert to draft because this book was bought by user.");
				return fail(400, { form });
			}
		}
		if (form.valid) {
			const isExist = await isExistBookUrlSlug(signInUser.id, form.data.urlSlug, params.bookId);
			if (isExist) {
				form.valid = false;
				form.errors.urlSlug = form.errors.urlSlug ?? [];
				form.errors.urlSlug.push('There is a book with the same URL.');
			}
		}
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { bookRevision, dbError: dbBookGetError } = await dbBookGet({
			bookId: params.bookId,
			userId: signInUser.id
		});
		if (!bookRevision || dbBookGetError) {
			return error(500, { message: dbBookGetError?.message ?? '' });
		}
		let bookLang = bookRevision.contents.find((lang) => lang.target_language === requestLang);
		if (!bookLang) {
			bookLang = bookRevision.contents[0];
		}
		if (!bookLang) {
			return error(500, { message: `Failed to get book contents. Book ID=${params.bookId}` });
		}
		const { book, dbError: dbBookUpdateError } = await dbBookUpdate({
			bookId: params.bookId,
			userId: signInUser.id,
			status: 0,
			...form.data,
			title: bookLang.title,
			subtitle: bookLang.subtitle,
			freeArea: bookLang.free_area,
			isEmptyFreeArea: bookLang.is_empty_free_area,
			paidArea: bookLang.paid_area,
			isEmptyPaidArea: bookLang.is_empty_paid_area,
			salesArea: bookLang.sales_area,
			isEmptySalesArea: bookLang.is_empty_sales_area
		});
		if (!book || dbBookUpdateError) {
			return error(500, { message: dbBookUpdateError?.message ?? '' });
		}

		redirect(303, setLanguageTagToPath(`/write`, url));
	},

	delete: async ({ url, locals, params }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}

		const { dbError } = await dbBookDelete({
			bookId: params.bookId,
			userId: signInUser.id
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		redirect(303, setLanguageTagToPath('/write', url));
	}
};
