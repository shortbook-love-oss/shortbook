import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dbBookGet } from '$lib/model/book/get';
import { dbBookBuyCreate, type DbBookBuyCreateRequest } from '$lib/model/book-buy/create';
import { dbUserPaymentContractCreate } from '$lib/model/user/payment-contract/create';
import { dbUserPaymentSettingUpsert } from '$lib/model/user/payment-setting/upsert';
import { decryptFromFlat } from '$lib/utilities/server/crypto';
import { checkPaymentStatus } from '$lib/utilities/server/payment';
import {
	getLanguageTagFromUrl,
	paymentBookInfoParam,
	paymentSessionIdParam,
	setLanguageTagToPath
} from '$lib/utilities/url';

export const load = async ({ url }) => {
	const requestLang = getLanguageTagFromUrl(url);

	// Allow payment data to be processed even if the ShortBook session expires during payment
	// Solution: use encrypt data in url search-param, instead of requests and cookies
	const bookPaymentInfoRaw = url.searchParams.get(paymentBookInfoParam);
	const paymentSessionIdRaw = url.searchParams.get(paymentSessionIdParam);
	if (typeof bookPaymentInfoRaw !== 'string' || typeof paymentSessionIdRaw !== 'string') {
		return error(404, { message: 'Not found' });
	}

	// /redirect/book/[bookId]/bought?sessionId=xxxxxxxxxx&bookInfo=xxxxxxxxxx
	// @todo Block paymentSessionId that have already been used to eliminate potential vulnerabilities
	const { paymentSessionId, currency, amount, customerId, isCreateCustomer, isAvailable } =
		await checkPaymentStatus(paymentSessionIdRaw);
	if (!isAvailable) {
		return error(402, {
			message: "Can't complete payment process, because your payment funds aren't yet available."
		});
	}

	// After charging points, create book bought history
	let bookPaymentInfo: DbBookBuyCreateRequest;
	try {
		const decryptedBookInfo = decryptFromFlat(
			bookPaymentInfoRaw,
			env.ENCRYPT_PAYMENT_BOOK_INFO,
			env.ENCRYPT_SALT
		);
		bookPaymentInfo = JSON.parse(decryptedBookInfo);
	} catch {
		return error(500, { message: 'Invalid URL parameter of book-info' });
	}

	const { book, dbError: dbBookGetError } = await dbBookGet({
		bookId: bookPaymentInfo.bookId,
		isIncludeDraft: true,
		isIncludeDelete: true
	});
	if (!book?.user.profiles || dbBookGetError) {
		return error(500, { message: dbBookGetError?.message ?? '' });
	}
	// @todo If the book you purchased is deleted or in draft status, points will not be consumed

	const afterUrl = new URL(
		url.origin +
			setLanguageTagToPath(`/@${book.user.profiles.key_name}/book/${book.key_name}`, requestLang)
	);

	const { dbError: dbBookBuyError } = await dbBookBuyCreate({
		...bookPaymentInfo,
		payment: {
			provider: 'stripe',
			sessionId: paymentSessionId,
			currency,
			amount
		}
	});
	if (dbBookBuyError) {
		return error(500, { message: dbBookBuyError?.message ?? '' });
	}

	if (currency) {
		const { dbError } = await dbUserPaymentSettingUpsert({
			userId: bookPaymentInfo.userId,
			currencyKey: currency
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}
	}

	if (isCreateCustomer) {
		const { dbError: dbContractError } = await dbUserPaymentContractCreate({
			userId: bookPaymentInfo.userId,
			providerKey: 'stripe',
			customerId
		});
		if (dbContractError) {
			return error(500, { message: dbContractError?.message ?? '' });
		}
	}

	redirect(303, afterUrl);
};
