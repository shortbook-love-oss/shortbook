import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dbBookGet } from '$lib/model/book/get';
import { dbBookBuyCreate, type DbBookBuyCreateRequest } from '$lib/model/book-buy/create';
import { dbBookBuyGet } from '$lib/model/book-buy/get';
import { dbCurrencyRateGet } from '$lib/model/currency/get';
import { dbUserPaymentContractGet } from '$lib/model/user/payment-contract/get';
import { dbUserPointList } from '$lib/model/user/point/list';
import { decryptFromFlat, encryptAndFlat } from '$lib/utilities/server/crypto';
import { createPaymentSession } from '$lib/utilities/server/payment';
import { redirectToSignInPage } from '$lib/utilities/server/url';
import { getCurrencyData, type CurrencySupportKeys } from '$lib/utilities/currency';
import { chargeFee } from '$lib/utilities/payment';
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
	const requestLang = getLanguageTagFromUrl(url);
	const bookId = params.bookId;

	const userEmail = decryptFromFlat(
		locals.session?.user?.email ?? '',
		env.ENCRYPT_EMAIL_USER,
		env.ENCRYPT_SALT
	);
	if (!userEmail) {
		return error(401, { message: 'Unauthorized' });
	}

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

	const { book, dbError: dbBookGetError } = await dbBookGet({ bookId });
	if (!book?.user.profiles || dbBookGetError) {
		return error(500, { message: dbBookGetError?.message ?? '' });
	}
	const afterPaymentUrl = new URL(
		url.origin + setLanguageTagToPath(`/redirect/book/${params.bookId}/bought`, requestLang)
	);
	const cancelUrl =
		url.origin +
		setLanguageTagToPath(`/@${book.user.profiles.key_name}/book/${book.key_name}`, requestLang);
	if (book.user_id === userId) {
		// Prevent buy own book
		return redirect(303, cancelUrl);
	}

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
		redirect(303, cancelUrl);
	}

	// Currency specification is required for payment process
	const requestCurrency = url.searchParams.get(paymentCurrencyParam) as CurrencySupportKeys | null;
	if (!requestCurrency || !getCurrencyData(requestCurrency)) {
		return error(400, { message: 'Currency must be specified.' });
	}

	// Need 100 USD + service fee to buy 100 point
	const pointAmountBase = (book.buy_point / 100) * (100 / (100 - chargeFee));
	const { currencyRateIndex, dbError: dbRateGetError } = await dbCurrencyRateGet({
		amount: pointAmountBase
	});
	if (dbRateGetError) {
		error(500, { message: dbRateGetError.message });
	}
	const paymentAmount = currencyRateIndex[requestCurrency];
	if (!paymentAmount) {
		// Doesn't support currency, just reload the page
		return error(400, { message: 'Selected currency is not support.' });
	}

	const { paymentContract, dbError: dbContractGetError } = await dbUserPaymentContractGet({
		userId,
		providerKey: 'stripe'
	});
	if (dbContractGetError) {
		return error(500, { message: dbContractGetError?.message ?? '' });
	}
	const paymentCustomerId = decryptFromFlat(
		paymentContract?.provider_customer_id ?? '',
		env.ENCRYPT_PAYMENT_CUSTOMER_ID,
		env.ENCRYPT_SALT
	);

	// If do not have enough points, use Stripe Checkout.
	// Need 456 points → charge 456 points
	// Need 8000 points → charge 8000 points
	dbBookBuyCreateReq.beforePointChargeAmount = book.buy_point;
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
		paymentAmount,
		paymentCustomerId,
		userEmail,
		afterPaymentUrl.href,
		cancelUrl
	);

	redirect(303, paymentSession.url ?? cancelUrl);
};
