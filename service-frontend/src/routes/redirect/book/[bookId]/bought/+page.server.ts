import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import {
	getLanguageTagFromUrl,
	paymentBookInfoParam,
	paymentSessionIdParam,
	setLanguageTagToPath
} from '$lib/utilities/url';
import { dbBookGet } from '$lib-backend/model/book/get';
import { dbBookBuyCreate, type DbBookBuyCreateRequest } from '$lib-backend/model/book-buy/create';
import { dbBookBuyGet } from '$lib-backend/model/book-buy/get';
import {
	dbUserPointCreate,
	type DbUserPaymentCheckoutCreateRequest
} from '$lib-backend/model/user/point/create';
import { dbUserPaymentContractCreate } from '$lib-backend/model/user/payment-contract/create';
import { dbUserPaymentSettingUpsert } from '$lib-backend/model/user/payment-setting/upsert';
import { decryptFromFlat, encryptAndFlat } from '$lib-backend/utilities/crypto';
import { checkPaymentStatus } from '$lib-backend/utilities/payment';

export const load = async ({ url }) => {
	const requestLang = getLanguageTagFromUrl(url);

	// Allow payment data to be processed even if the ShortBook session expires during payment
	// Solution: use encrypt data in url search-param, instead of requests and cookies

	// /redirect/book/[bookId]/bought?sessionId=xxxxxxxxxx&bookInfo=xxxxxxxxxx
	const bookPaymentInfoRaw = url.searchParams.get(paymentBookInfoParam);
	const paymentSessionIdRaw = url.searchParams.get(paymentSessionIdParam);
	if (typeof bookPaymentInfoRaw !== 'string' || typeof paymentSessionIdRaw !== 'string') {
		return error(404, { message: 'Not found' });
	}

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

	const {
		book,
		bookRevision,
		dbError: dbBookGetError
	} = await dbBookGet({
		bookId: bookPaymentInfo.bookId,
		isIncludeDelete: true
	});
	if (!book?.user || !bookRevision || dbBookGetError) {
		return error(500, { message: dbBookGetError?.message ?? '' });
	}

	const afterUrl = new URL(
		url.origin +
			setLanguageTagToPath(`/@${book.user.key_handle}/book/${book.url_slug}`, requestLang)
	);
	const paymentCheckoutRequest: DbUserPaymentCheckoutCreateRequest = {
		provider: 'stripe',
		sessionId: encryptAndFlat(paymentSessionId, env.ENCRYPT_PAYMENT_SESSION_ID, env.ENCRYPT_SALT),
		currency,
		amount
	};

	const { bookBuy, dbError: dbBookBuyGetError } = await dbBookBuyGet({
		bookId: bookPaymentInfo.bookId,
		userId: bookPaymentInfo.userId
	});
	if (dbBookBuyGetError) {
		return error(500, { message: dbBookBuyGetError.message });
	}

	if (bookRevision.status === 0 || book.deleted_at != null || bookBuy) {
		// If the book is deleted or draft, return as point
		// If already bought same book, return as point (this occurs due to multiple tab payments)
		const { dbError } = await dbUserPointCreate({
			userId: bookPaymentInfo.userId,
			paymentCheckoutId: bookPaymentInfo.payment?.sessionId,
			amount: bookPaymentInfo.pointSpend,
			payment: paymentCheckoutRequest
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}
		redirect(303, afterUrl);
	}

	const { dbError: dbBookBuyCreateError } = await dbBookBuyCreate({
		...bookPaymentInfo,
		payment: paymentCheckoutRequest
	});
	if (dbBookBuyCreateError) {
		return error(500, { message: dbBookBuyCreateError?.message ?? '' });
	}

	if (currency) {
		const { dbError } = await dbUserPaymentSettingUpsert({
			userId: bookPaymentInfo.userId,
			currencyCode: currency
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}
	}

	if (isCreateCustomer) {
		const { dbError: dbContractError } = await dbUserPaymentContractCreate({
			userId: bookPaymentInfo.userId,
			providerKey: 'stripe',
			customerId: encryptAndFlat(customerId, env.ENCRYPT_PAYMENT_CUSTOMER_ID, env.ENCRYPT_SALT)
		});
		if (dbContractError) {
			return error(500, { message: dbContractError?.message ?? '' });
		}
	}

	redirect(303, afterUrl);
};
