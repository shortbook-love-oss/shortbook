import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dbBookGetMinimum } from '$lib/model/book/get-minimum';
import { dbBookBuyCreate, type DbBookBuyCreateRequest } from '$lib/model/book-buy/create';
import { dbBookBuyGet } from '$lib/model/book-buy/get';
import { dbUserPaymentContractGet } from '$lib/model/user/payment-contract/get';
import { dbUserPointList } from '$lib/model/user/point/list';
import { decryptFromFlat, encryptAndFlat } from '$lib/utilities/server/crypto';
import { createPaymentSession } from '$lib/utilities/server/payment';
import { redirectToSignInPage } from '$lib/utilities/server/url';
import { getCurrencyData, type CurrencySupportKeys } from '$lib/utilities/currency';
import {
	getLanguageTagFromUrl,
	paymentBookInfoParam,
	paymentCurrencyParam,
	setLanguageTagToPath
} from '$lib/utilities/url';

export const load = async ({ url, params, locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return redirectToSignInPage(url);
	}
	const requestCurrency = url.searchParams.get(paymentCurrencyParam);
	if (!requestCurrency || !getCurrencyData(requestCurrency)) {
		return error(400, { message: 'Currency must be specified.' });
	}
	const requestLang = getLanguageTagFromUrl(url);
	const bookId = params.bookId;

	const userEmail = decryptFromFlat(
		locals.session?.user?.email ?? '',
		env.ENCRYPT_EMAIL_USER,
		env.ENCRYPT_SALT
	);
	const callbackUrl = url.origin + setLanguageTagToPath(`/book/${bookId}`, requestLang);

	const { bookBuy, dbError: dbBookBuyError } = await dbBookBuyGet({ userId, bookId });
	if (dbBookBuyError) {
		return error(500, { message: dbBookBuyError?.message ?? '' });
	} else if (bookBuy) {
		return error(500, { message: `Already bought this book, Book ID=${bookId}` });
	}
	const { currentPoint, dbError: dbUserPointError } = await dbUserPointList({ userId });
	if (dbUserPointError) {
		return error(500, { message: dbUserPointError?.message ?? '' });
	}
	const { book, dbError: dbBookPointError } = await dbBookGetMinimum({ bookId });
	if (!book || dbBookPointError) {
		return error(500, { message: dbBookPointError?.message ?? '' });
	} else if (book.user_id === userId) {
		return error(404, { message: 'Not found' });
	}
	const { paymentContract, dbError: dbContractGetError } = await dbUserPaymentContractGet({
		userId,
		providerKey: 'stripe'
	});
	if (dbContractGetError) {
		return error(500, { message: dbContractGetError?.message ?? '' });
	}
	const paymentCustomerId = paymentContract?.provider_customer_id ?? '';

	// If users can pay with the points they have, use it
	const dbBookBuyCreateReq: DbBookBuyCreateRequest = {
		bookId,
		writeUserId: book.user_id,
		userId,
		pointSpend: book.buy_point,
		beforePointChargeAmount: 0
	};
	if (currentPoint >= book.buy_point) {
		const { dbError: dbBookBuyError } = await dbBookBuyCreate(dbBookBuyCreateReq);
		if (dbBookBuyError) {
			return error(500, { message: dbBookBuyError?.message ?? '' });
		}
		redirect(303, callbackUrl);
	}
	// Need 456 points → charge 456 points
	// Need 8000 points → charge 8000 points
	dbBookBuyCreateReq.beforePointChargeAmount = book.buy_point;

	// If do not have enough points, use Stripe Checkout.
	const afterPaymentUrl = new URL(
		url.origin + setLanguageTagToPath(`/book/${params.bookId}/bought`, requestLang)
	);
	const bookPaymentInfo = encryptAndFlat(
		JSON.stringify(dbBookBuyCreateReq),
		env.ENCRYPT_PAYMENT_BOOK_INFO,
		env.ENCRYPT_SALT
	);
	afterPaymentUrl.searchParams.set(paymentBookInfoParam, bookPaymentInfo);
	const paymentSession = await createPaymentSession(
		'ShortBook point charge',
		`Charge ${dbBookBuyCreateReq.beforePointChargeAmount} points for ShortBook`,
		'txcd_10103000', // SaaS for personnel (If business, use txcd_10103001)
		requestCurrency as CurrencySupportKeys,
		dbBookBuyCreateReq.beforePointChargeAmount,
		paymentCustomerId,
		userEmail,
		afterPaymentUrl.href,
		callbackUrl
	);

	redirect(303, paymentSession.url ?? callbackUrl);
};
