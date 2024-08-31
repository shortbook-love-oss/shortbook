import { error } from '@sveltejs/kit';
import { env as envPublic } from '$env/dynamic/public';
import { dbBookGet } from '$lib/model/book/get';
import { dbBookBuyGet } from '$lib/model/book-buy/get';
import { dbCurrencyRateGet } from '$lib/model/currency/get';
import { dbUserPaymentSettingGet } from '$lib/model/user/payment-setting/get';
import { dbUserPointList } from '$lib/model/user/point/list';
import { type BookDetail, getBookCover, contentsToMarkdown } from '$lib/utilities/book';
import {
	defaultCurrency,
	guessCurrencyByLang,
	type CurrencySupportKeys
} from '$lib/utilities/currency';
import { calcPriceByPoint } from '$lib/utilities/payment';
import type { SelectItem } from '$lib/utilities/select';
import { getLanguageTagFromUrl } from '$lib/utilities/url';

export const load = async ({ url, locals, params }) => {
	const userId = locals.session?.user?.id;
	const requestLang = getLanguageTagFromUrl(url);

	const { book, dbError: dbBookGetError } = await dbBookGet({
		bookKeyName: params.bookKey,
		userKeyName: params.userKey,
		isIncludeDraft: true,
		isIncludeDelete: true
	});
	if (!book || !book.cover || dbBookGetError) {
		return error(500, { message: dbBookGetError?.message ?? '' });
	}
	let bookLang = book.languages.find((lang) => lang.language_code === requestLang);
	if (!bookLang && book.languages.length) {
		bookLang = book.languages[0];
	}
	if (!bookLang) {
		return error(500, { message: `Failed to get book contents. Book Key-name=${params.bookKey}` });
	}
	const profile = book.user.profiles;
	let profileLang = profile?.languages.find((lang) => lang.language_code === requestLang);
	if (!profileLang && profile?.languages.length) {
		profileLang = profile.languages[0];
	}
	if (!profile || !profileLang) {
		return error(500, {
			message: `Failed to get profile contents. User Key-name=${params.userKey}`
		});
	}

	let primaryCurrency: CurrencySupportKeys = defaultCurrency.key;
	if (userId) {
		const { paymentSetting, dbError: dbPayGetError } = await dbUserPaymentSettingGet({ userId });
		if (dbPayGetError) {
			return error(500, { message: dbPayGetError.message });
		}
		if (paymentSetting?.currency) {
			primaryCurrency = paymentSetting.currency as CurrencySupportKeys;
		} else {
			primaryCurrency = guessCurrencyByLang(requestLang);
		}
	} else {
		primaryCurrency = guessCurrencyByLang(requestLang);
	}

	// Check buy book if it's paid and written by another
	const buyPoint = book.buy_point;
	const isOwn = userId === book.user_id;
	let isBoughtBook = false;
	// Can user buy books using only the points have
	let hasEnoughPoint = false;
	let userPoint = 0;
	if (userId && !isBoughtBook && buyPoint > 0 && !isOwn) {
		const { bookBuy, dbError: dbBookBuyError } = await dbBookBuyGet({
			userId,
			bookId: book.id
		});
		if (dbBookBuyError) {
			return error(500, { message: dbBookBuyError?.message ?? '' });
		}
		isBoughtBook = !!bookBuy;
		const { currentPoint, dbError: dbPointListError } = await dbUserPointList({ userId });
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

	let currencyPreviews: SelectItem<CurrencySupportKeys>[] = [];
	// Skip check if buy with points only
	if (!isBoughtBook && buyPoint > 0 && !isOwn && !hasEnoughPoint) {
		// Show book price by all supported currencies
		const { currencyRateIndex, dbError: dbRateGetError } = await dbCurrencyRateGet({
			amount: buyPoint / 100
		});
		if (dbRateGetError) {
			error(500, { message: dbRateGetError.message });
		}
		currencyPreviews = calcPriceByPoint(currencyRateIndex, requestLang);
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
		bookKeyName: book.key_name,
		userKeyName: profile.key_name,
		penName: profileLang.pen_name,
		userImage: envPublic.PUBLIC_ORIGIN_IMAGE_CDN + (book.user.image ?? ''),
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
		profileLang,
		isOwn,
		isBoughtBook,
		hasEnoughPoint,
		userPoint,
		currencyPreviews,
		primaryCurrency
	};
};
