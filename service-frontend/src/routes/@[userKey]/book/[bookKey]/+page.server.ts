import { error } from '@sveltejs/kit';
import { env as envPublic } from '$env/dynamic/public';
import { type BookDetail, getBookCover, contentsToMarkdown } from '$lib/utilities/book';
import {
	currencySupports,
	guessCurrencyByLang,
	type CurrencySupportCodes
} from '$lib/utilities/currency';
import { chargeFee, getAccuratePaymentPrice } from '$lib/utilities/payment';
import type { SelectItem, SelectListGroup } from '$lib/utilities/select';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { dbBookGet } from '$lib-backend/model/book/get';
import { dbBookBuyGet } from '$lib-backend/model/book-buy/get';
import { dbCurrencyRateGet } from '$lib-backend/model/currency/get';
import { dbUserPaymentSettingGet } from '$lib-backend/model/user/payment-setting/get';
import { dbUserPointList } from '$lib-backend/model/user/point/list';

export const load = async ({ url, locals, params }) => {
	const signInUser = locals.signInUser;
	const requestLang = getLanguageTagFromUrl(url);

	const { book, dbError: dbBookGetError } = await dbBookGet({
		bookUrlSlug: params.bookKey,
		userKeyHandle: params.userKey,
		isIncludeDraft: true,
		isIncludeDelete: true
	});
	if (!book || !book.cover || dbBookGetError) {
		return error(500, { message: dbBookGetError?.message ?? '' });
	}
	let bookLang = book.languages.find((lang) => lang.target_language === requestLang);
	if (!bookLang && book.languages.length) {
		bookLang = book.languages[0];
	}
	if (!bookLang) {
		return error(500, { message: `Failed to get book contents. Book Key-name=${params.bookKey}` });
	}
	let userLang = book.user.languages.find((lang) => lang.target_language === requestLang);
	if (!userLang && book.user.languages.length) {
		userLang = book.user.languages[0];
	}
	if (!userLang) {
		return error(500, {
			message: `Failed to get profile contents. User Key-name=${params.userKey}`
		});
	}

	// Check buy book if it's paid and written by another
	const buyPoint = book.buy_point;
	const isOwn = signInUser?.id === book.user_id;
	let isBoughtBook = false;
	// Can user buy books using only the points have
	let hasEnoughPoint = false;
	let userPoint = 0;
	if (signInUser && !isBoughtBook && buyPoint > 0 && !isOwn) {
		const { bookBuy, dbError: dbBookBuyError } = await dbBookBuyGet({
			userId: signInUser.id,
			bookId: book.id
		});
		if (dbBookBuyError) {
			return error(500, { message: dbBookBuyError?.message ?? '' });
		}
		isBoughtBook = !!bookBuy;
		const { currentPoint, dbError: dbPointListError } = await dbUserPointList({
			userId: signInUser.id
		});
		if (dbPointListError) {
			return error(500, { message: dbPointListError?.message ?? '' });
		}
		hasEnoughPoint = currentPoint >= buyPoint;
		userPoint = currentPoint;
	}

	if (book.status === 0 && !isOwn) {
		return error(404, { message: 'Not found' });
	}
	if (book.deleted_at != null && !isBoughtBook && !isOwn) {
		return error(404, { message: 'Not found' });
	}

	const currencyList: SelectListGroup<CurrencySupportCodes>[] = currencySupports;
	let primaryCurrency: SelectItem<CurrencySupportCodes> | null = null;
	// Skip check if buy with points only
	if (!isBoughtBook && buyPoint > 0 && !isOwn && !hasEnoughPoint) {
		// Show book price by all supported currencies
		const { currencyRateIndex, dbError: dbRateGetError } = await dbCurrencyRateGet({
			amount: buyPoint / 100
		});
		if (dbRateGetError) {
			error(500, { message: dbRateGetError.message });
		}

		let primaryCurrencyCode: CurrencySupportCodes;
		if (signInUser) {
			const { paymentSetting, dbError: dbPayGetError } = await dbUserPaymentSettingGet({
				userId: signInUser.id
			});
			if (!paymentSetting || dbPayGetError) {
				return error(500, { message: dbPayGetError?.message ?? '' });
			}
			primaryCurrencyCode = paymentSetting.currency as CurrencySupportCodes;
		} else {
			primaryCurrencyCode = guessCurrencyByLang(requestLang);
		}

		// Add price into item of supported currency list
		for (const group of currencyList) {
			for (const item of group.childs) {
				const basePrice = currencyRateIndex[item.value];
				if (!basePrice) {
					continue;
				}
				const priceText = getAccuratePaymentPrice(
					basePrice * (100 / (100 - chargeFee)),
					item.value,
					requestLang
				);
				if (priceText != null) {
					item.text = priceText.text;
				}

				if (item.value === primaryCurrencyCode) {
					primaryCurrency = item;
				}
			}
		}
	}

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
	const bookDetail: BookDetail = {
		...bookCover,
		id: book.id,
		userId: book.user_id,
		status: book.status,
		buyPoint,
		title: bookLang.title,
		subtitle: bookLang.subtitle,
		publishedAt: book.published_at,
		updatedAt: book.updated_at,
		bookUrlSlug: book.url_slug,
		userKeyHandle: book.user.key_handle,
		penName: book.user.pen_name,
		userImage: envPublic.PUBLIC_ORIGIN_IMAGE_CDN + book.user.image_src,
		prologue: await contentsToMarkdown(bookLang.prologue),
		content: '',
		salesMessage: '',
		isBookDeleted: book.deleted_at != null
	};

	if (isBoughtBook || buyPoint === 0 || isOwn) {
		bookDetail.content = await contentsToMarkdown(bookLang.content);
	} else {
		bookDetail.salesMessage = await contentsToMarkdown(bookLang.sales_message);
	}

	return {
		bookDetail,
		requestLang,
		userLang,
		isOwn,
		isBoughtBook,
		hasEnoughPoint,
		userPoint,
		currencyList,
		primaryCurrency
	};
};
