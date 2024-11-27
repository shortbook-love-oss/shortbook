import { error } from '@sveltejs/kit';
import { env as envPublic } from '$env/dynamic/public';
import { getBookCover, type BookDetail } from '$lib/utilities/book';
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

	// Get a book even if it's a draft, and filter it later
	const {
		book,
		bookRevision,
		dbError: dbBookGetError
	} = await dbBookGet({
		bookUrlSlug: params.bookKey,
		userKeyHandle: params.userKey,
		statuses: [1],
		contentsLanguage: requestLang,
		isIncludeDelete: true
	});
	if (!book || !bookRevision?.cover || dbBookGetError) {
		return error(500, { message: dbBookGetError?.message ?? '' });
	}
	const bookLang = bookRevision.contents[0];
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
	const buyPoint = bookRevision.buy_point;
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

	if (bookRevision.status === 0 && !isOwn) {
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
		buyPoint,
		title: bookLang.title,
		subtitle: bookLang.subtitle,
		updatedAt: bookRevision.updated_at,
		bookUrlSlug: bookRevision.url_slug,
		userKeyHandle: book.user.key_handle,
		penName: book.user.pen_name,
		userImage: envPublic.PUBLIC_ORIGIN_IMAGE_CDN + book.user.image_src,
		freeArea: '',
		paidArea: '',
		salesArea: '',
		isBookDeleted: book.deleted_at != null
	};

	if (bookRevision.has_free_area) {
		bookDetail.freeArea = bookLang.free_area_html;
	}
	const hasPaidArea = bookRevision.has_paid_area;

	if (isBoughtBook || buyPoint === 0 || isOwn) {
		if (hasPaidArea) {
			bookDetail.paidArea = bookLang.paid_area_html;
		}
	} else {
		if (bookRevision.has_sales_area) {
			bookDetail.salesArea = bookLang.sales_area_html;
		}
	}

	return {
		bookDetail,
		hasPaidArea,
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
