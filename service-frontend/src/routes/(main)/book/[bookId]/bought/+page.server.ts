import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dbBookBuyCreate, type DbBookBuyCreateRequest } from '$lib/model/book-buy/create';
import { dbUserPaymentContractCreate } from '$lib/model/user/payment-contract/create';
import { decryptFromFlat } from '$lib/utilities/server/crypto';
import { checkPaymentStatus } from '$lib/utilities/server/payment';
import {
	paymentBookInfoParam,
	paymentSessionIdParam,
	setLanguageTagToPath
} from '$lib/utilities/url';

export const load = async ({ url, params }) => {
	// Allow payment data to be processed even if the ShortBook session expires during payment
	// Solution: use encrypt data in url search-param, instead of requests and cookies
	const bookPaymentInfoRaw = url.searchParams.get(paymentBookInfoParam);
	const paymentSessionIdRaw = url.searchParams.get(paymentSessionIdParam);
	if (typeof bookPaymentInfoRaw !== 'string' || typeof paymentSessionIdRaw !== 'string') {
		return error(404, { message: 'Not found' });
	}

	// /book/[bookId]/bought?sessionId=xxxxxxxxxx&bookInfo=xxxxxxxxxx
	// @todo Block paymentSessionId that have already been used to eliminate potential vulnerabilities
	const { paymentSessionId, customerId, isCreateCustomer, isAvailable } =
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
	const { dbError: dbBookBuyError } = await dbBookBuyCreate({
		...bookPaymentInfo,
		paymentSessionId
	});
	if (dbBookBuyError) {
		return error(500, { message: dbBookBuyError?.message ?? '' });
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

	redirect(303, url.origin + setLanguageTagToPath(`/book/${params.bookId}`, url));
};
