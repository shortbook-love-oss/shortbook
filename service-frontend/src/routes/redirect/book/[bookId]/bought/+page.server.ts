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

	const getResult = await Promise.all([
		(async () => {
			const { paymentSessionId, currency, amount, customerId, isCreateCustomer, isAvailable } =
				await checkPaymentStatus(paymentSessionIdRaw);
			if (!isAvailable) {
				throw new Error(
					"Can't complete payment process, because your payment funds aren't yet available."
				);
			}
			return { paymentSessionId, currency, amount, customerId, isCreateCustomer };
		})(),

		(async () => {
			const {
				book,
				bookRevision,
				dbError: dbBookGetError
			} = await dbBookGet({
				bookId: bookPaymentInfo.bookId,
				statuses: [1],
				contentsLanguage: requestLang,
				isIncludeDelete: true
			});
			if (!book?.user || !bookRevision || dbBookGetError) {
				throw new Error(dbBookGetError?.message ?? '');
			}
			return { book, bookRevision };
		})(),

		(async () => {
			const { bookBuy, dbError: dbBookBuyGetError } = await dbBookBuyGet({
				bookId: bookPaymentInfo.bookId,
				userId: bookPaymentInfo.userId
			});
			if (dbBookBuyGetError) {
				throw new Error(dbBookBuyGetError.message);
			}
			return { bookBuy };
		})()
	]).catch((error: Error) => {
		console.error(error.message);
		return error;
	});
	if (getResult instanceof Error) {
		return error(500, { message: getResult.message });
	}

	const [
		{ paymentSessionId, currency, amount, customerId, isCreateCustomer },
		{ book, bookRevision },
		{ bookBuy }
	] = getResult;

	const paymentCheckoutRequest: DbUserPaymentCheckoutCreateRequest = {
		provider: 'stripe',
		sessionId: encryptAndFlat(paymentSessionId, env.ENCRYPT_PAYMENT_SESSION_ID, env.ENCRYPT_SALT),
		currency,
		amount
	};
	const afterUrl = new URL(
		url.origin +
			setLanguageTagToPath(`/@${book.user.key_handle}/book/${bookRevision.url_slug}`, requestLang)
	);

	if (book.deleted_at != null || bookBuy) {
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

	const saveResult = await Promise.all([
		(async () => {
			if (currency) {
				const { dbError } = await dbUserPaymentSettingUpsert({
					userId: bookPaymentInfo.userId,
					currencyCode: currency
				});
				if (dbError) {
					throw dbError;
				}
			}
		})(),

		(async () => {
			if (isCreateCustomer) {
				const { dbError: dbContractError } = await dbUserPaymentContractCreate({
					userId: bookPaymentInfo.userId,
					providerKey: 'stripe',
					customerId: encryptAndFlat(customerId, env.ENCRYPT_PAYMENT_CUSTOMER_ID, env.ENCRYPT_SALT)
				});
				if (dbContractError) {
					throw dbContractError;
				}
			}
		})(),

		(async () => {
			const { dbError: dbBookBuyCreateError } = await dbBookBuyCreate({
				...bookPaymentInfo,
				payment: paymentCheckoutRequest
			});
			if (dbBookBuyCreateError) {
				throw dbBookBuyCreateError;
			}
		})()
	]).catch((error: Error) => {
		console.error(error.message);
		return error;
	});
	if (saveResult instanceof Error) {
		return error(500, { message: saveResult.message });
	}

	redirect(303, afterUrl);
};
