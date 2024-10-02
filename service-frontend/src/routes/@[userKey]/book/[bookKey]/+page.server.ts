import { error } from '@sveltejs/kit';
import { env as envPublic } from '$env/dynamic/public';
import { type BookDetail, getBookCover, contentsToMarkdown } from '$lib/utilities/book';
import {
	currencySupports,
	defaultCurrencyCode,
	formatPrice,
	guessCurrencyByLang,
	type CurrencySupportCodes
} from '$lib/utilities/currency';
import {
	chargeFee,
	getAccuratePaymentPrice,
	toPaymentAmountOfStripe
} from '$lib/utilities/payment';
import { isSelectGroup, type SelectItem, type SelectItemSingle } from '$lib/utilities/select';
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

	const currencyList: SelectItem<CurrencySupportCodes>[] = currencySupports;
	let primaryCurrency: SelectItemSingle<CurrencySupportCodes> | null = null;
	if (!isBoughtBook && buyPoint > 0 && !isOwn && !hasEnoughPoint) {
		// If haven't bought book yet and haven't enough point to buy, calc price and show
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

		// Show book price by all supported currencies
		for (const group of currencyList) {
			if (!isSelectGroup(group)) {
				continue;
			}

			for (const item of group.childs) {
				const basePrice = currencyRateIndex[item.value];
				if (!basePrice) {
					continue;
				}
				const priceWithFee = basePrice * (100 / (100 - chargeFee));
				// e.g. (USD) 2.17 , (ISK) 296 , (UGX) 8038
				const accuratePrice = getAccuratePaymentPrice(priceWithFee, item.value);
				// e.g. (USD) "217" , (ISK) "29600" , (UGX) "803800"
				const paymentAmount = toPaymentAmountOfStripe(accuratePrice, item.value);
				if (item.value === 'inr' ? paymentAmount.length <= 9 : paymentAmount.length <= 8) {
					// e.g. "$2.17" , "ISK 296" , "UGX 8,038"
					const formattedPrice = formatPrice(accuratePrice, item.value, requestLang);
					item.text = formattedPrice;
				} else {
					// If the amount exceeds 8 digits (INR is 9 digits), an error occurs in Stripe and payment cannot be made
					// Do not display prices in the currency that matches the criteria
					item.text = undefined;
				}

				if (item.value === primaryCurrencyCode) {
					primaryCurrency = item;
				}
			}
		}

		if (primaryCurrency && !primaryCurrency.text) {
			primaryCurrency = (() => {
				for (const group of currencyList) {
					if (!isSelectGroup(group)) {
						continue;
					}
					for (const item of group.childs) {
						if (item.value === defaultCurrencyCode && item.text) {
							return item;
						}
					}
				}
				return null;
			})();
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
