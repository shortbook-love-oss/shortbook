import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { editLoad } from '$lib/components/service/write/edit-load';
import type { AvailableLanguageTag } from '$lib/i18n/paraglide/runtime';
import { dbBookDelete } from '$lib/model/book/delete';
import { dbBookGet } from '$lib/model/book/get';
import { dbBookUpdate } from '$lib/model/book/update';
import { dbBookBuyList } from '$lib/model/book-buy/list';
import { dbUserProfileGet } from '$lib/model/user/profile/get';
import { getBookCover } from '$lib/utilities/book';
import { languageAndNotSelect } from '$lib/utilities/language';
import { setLanguageTagToPath } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book-update';

export const load = async ({ locals, params }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	const form = await superValidate(zod(schema));
	const langTags = languageAndNotSelect;

	const { book, dbError } = await dbBookGet({
		bookId: params.bookId,
		userId,
		isIncludeDraft: true
	});
	if (!book || !book.cover || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	let bookLang = book?.languages[0];

	const { bookBuys, dbError: dbBuyListError } = await dbBookBuyList({ bookId: params.bookId });
	if (!bookBuys || dbBuyListError) {
		return error(500, { message: dbBuyListError?.message ?? '' });
	}
	const isBoughtByOther = bookBuys.length > 0;

	const { userKeyName, penName, selectedCurrencyKey, currencyRates } = await editLoad(userId);

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
	form.data.keyName = book.key_name;
	form.data.buyPoint = book.buy_point;

	const initTitle = form.data.title;
	const status = book?.status ?? 0;

	return {
		form,
		userKeyName,
		penName,
		langTags,
		status,
		initTitle,
		isBoughtByOther,
		selectedCurrencyKey,
		currencyRates
	};
};

export const actions = {
	update: async ({ request, url, locals, params }) => {
		const userId = locals.session?.user?.id;
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { book, dbError: dbBookUpdateError } = await dbBookUpdate({
			bookId: params.bookId,
			userId,
			status: 1,
			...form.data
		});
		if (!book || dbBookUpdateError) {
			return error(500, { message: dbBookUpdateError?.message ?? '' });
		}

		const { profile, dbError: dbProfileGetError } = await dbUserProfileGet({ userId });
		if (!profile || dbProfileGetError) {
			return error(500, { message: dbProfileGetError?.message ?? '' });
		}

		redirect(303, setLanguageTagToPath(`/@${profile.key_name}/book/${book.key_name}`, url));
	},

	draft: async ({ request, url, locals, params }) => {
		const userId = locals.session?.user?.id;
		if (!userId) {
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
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { book, dbError: dbBookUpdateError } = await dbBookUpdate({
			bookId: params.bookId,
			userId,
			status: 0,
			...form.data
		});
		if (!book || dbBookUpdateError) {
			return error(500, { message: dbBookUpdateError?.message ?? '' });
		}

		redirect(303, setLanguageTagToPath(`/write`, url));
	},

	delete: async ({ url, locals, params }) => {
		const userId = locals.session?.user?.id;
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const { dbError } = await dbBookDelete({
			bookId: params.bookId,
			userId
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		redirect(303, setLanguageTagToPath('/write', url));
	}
};
