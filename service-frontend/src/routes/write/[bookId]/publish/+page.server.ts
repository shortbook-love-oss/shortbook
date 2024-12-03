import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { availableLanguageTags } from '$i18n/output/runtime';
import { getBookCover } from '$lib/utilities/book';
import { languageSelect, type AvailableLanguageTags } from '$lib/utilities/language';
import { setLanguageTagToPath } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book/update';
import { validateOnlyVisibleChar } from '$lib/validation/rules/string';
import { isExistBookUrlSlug } from '$lib-backend/functions/service/book/edit-action';
import { editLoad } from '$lib-backend/functions/service/book/edit-load';
import { translateBookFreeContents } from '$lib-backend/functions/service/book/translate-to-other';
import { dbBookGet } from '$lib-backend/model/book/get';
import { dbBookUpdate } from '$lib-backend/model/book/update';
import { dbBookBuyList } from '$lib-backend/model/book-buy/list';

export const load = async ({ locals, params }) => {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}

	const form = await superValidate(zod(schema));
	const langTags = languageSelect;

	const { book, bookRevision, dbError } = await dbBookGet({
		bookId: params.bookId,
		userId: signInUser.id
	});
	if (dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	if (!book || !bookRevision?.cover) {
		return error(500, { message: `Can't find book. Book ID=${params.bookId}` });
	}

	if (
		!validateOnlyVisibleChar(bookRevision.title) ||
		!(bookRevision.has_free_area || bookRevision.has_paid_area)
	) {
		redirect(303, `/write/${book.id}`);
	}

	const { userCurrencyCode, currencyRateIndex } = await editLoad(signInUser);

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
	for (const coverProp in bookCover) {
		const prop = coverProp as keyof typeof bookCover;
		if (prop !== 'title' && prop !== 'subtitle') {
			form.data[prop] = bookCover[prop] as never;
		}
	}
	form.data.urlSlug = bookRevision.url_slug;
	form.data.buyPoint = bookRevision.buy_point;
	form.data.targetLanguage = bookRevision.native_language as AvailableLanguageTags;
	form.data.isTranslateToAll = bookRevision.is_translate_to_all;
	form.data.translateLanguages = bookRevision.translate_languages.map(
		(lang) => lang.target_language as AvailableLanguageTags
	);

	const initTitle = bookRevision.title;
	const initSubtitle = bookRevision.subtitle;
	const status = bookRevision.status;
	const hasPaidArea = bookRevision.has_paid_area;

	return {
		form,
		langTags,
		initTitle,
		initSubtitle,
		status,
		hasPaidArea,
		userCurrencyCode,
		currencyRateIndex
	};
};

export const actions = {
	publish: async ({ request, url, locals, params }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}

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

		const { bookRevision, dbError: dbBookUpdateError } = await dbBookUpdate({
			bookId: params.bookId,
			userId: signInUser.id,
			status: 1,
			...form.data
		});
		if (!bookRevision || dbBookUpdateError) {
			return error(500, { message: dbBookUpdateError?.message ?? '' });
		}

		const bookNativeLang = bookRevision.native_language as AvailableLanguageTags;
		let outputLangs = availableLanguageTags.filter((langTag) => {
			return langTag !== bookNativeLang;
		});
		if (!bookRevision.is_translate_to_all) {
			outputLangs = form.data.translateLanguages.filter((langTag) => {
				return langTag !== bookNativeLang;
			});
		}
		// Translate only a paid book
		if (bookRevision.has_paid_area && outputLangs.length > 0) {
			await translateBookFreeContents(bookRevision.id, bookNativeLang, outputLangs);
		}

		redirect(303, setLanguageTagToPath(`/@${signInUser.keyHandle}/book/${form.data.urlSlug}`, url));
	},

	draft: async ({ request, url, locals, params }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}

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

		const { dbError: dbBookUpdateError } = await dbBookUpdate({
			bookId: params.bookId,
			userId: signInUser.id,
			status: 0,
			...form.data
		});
		if (dbBookUpdateError) {
			return error(500, { message: dbBookUpdateError?.message ?? '' });
		}

		redirect(303, setLanguageTagToPath(`/write`, url));
	}
};
