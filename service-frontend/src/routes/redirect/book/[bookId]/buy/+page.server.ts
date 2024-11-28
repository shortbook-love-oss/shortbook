import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { getCurrencyData, type CurrencySupportCodes } from '$lib/utilities/currency';
import { chargeFee } from '$lib/utilities/payment';
import {
	getLanguageTagFromUrl,
	paymentBookInfoParam,
	paymentCurrencyParam,
	setLanguageTagToPath
} from '$lib/utilities/url';
import { dbBookGet } from '$lib-backend/model/book/get';
import { dbBookBuyCreate, type DbBookBuyCreateRequest } from '$lib-backend/model/book-buy/create';
import { dbBookBuyGet } from '$lib-backend/model/book-buy/get';
import { dbCurrencyRateGet } from '$lib-backend/model/currency/get';
import { dbUserPaymentContractGet } from '$lib-backend/model/user/payment-contract/get';
import { dbUserPointList } from '$lib-backend/model/user/point/list';
import { decryptFromFlat, encryptAndFlat } from '$lib-backend/utilities/crypto';
import { createPaymentSession } from '$lib-backend/utilities/payment';
import { redirectToSignInPage } from '$lib-backend/utilities/url';

export const load = async ({ url, params, locals }) => {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return redirectToSignInPage(url);
	}
	const requestLang = getLanguageTagFromUrl(url);
	const bookId = params.bookId;

	const userEmail = decryptFromFlat(signInUser.email, env.ENCRYPT_EMAIL_USER, env.ENCRYPT_SALT);
	if (!userEmail) {
		return error(401, { message: 'Unauthorized' });
	}
	const { currentPoint, dbError: dbUserPointError } = await dbUserPointList({
		userId: signInUser.id
	});
	if (dbUserPointError) {
		return error(500, { message: dbUserPointError?.message ?? '' });
	}

	const {
		book,
		bookRevision,
		dbError: dbBookGetError
	} = await dbBookGet({
		bookId,
		statuses: [1]
	});
	if (!book?.user || !bookRevision || dbBookGetError) {
		return error(500, { message: dbBookGetError?.message ?? '' });
	}
	const afterPaymentUrl = new URL(
		url.origin + setLanguageTagToPath(`/redirect/book/${params.bookId}/bought`, requestLang)
	);
	const cancelUrl =
		url.origin +
		setLanguageTagToPath(`/@${book.user.key_handle}/book/${bookRevision.url_slug}`, requestLang);
	if (book.user_id === signInUser.id) {
		// Prevent buy own book
		return redirect(303, cancelUrl);
	}

	const { bookBuy, dbError: dbBookBuyError } = await dbBookBuyGet({
		userId: signInUser.id,
		bookId
	});
	if (dbBookBuyError) {
		return error(500, { message: dbBookBuyError?.message ?? '' });
	} else if (bookBuy) {
		// Already bought this book
		return redirect(303, cancelUrl);
	}

	// If users can pay with the points they have, use it
	const dbBookBuyCreateReq: DbBookBuyCreateRequest = {
		bookId,
		writeUserId: book.user_id,
		userId: signInUser.id,
		pointSpend: bookRevision.buy_point,
		beforePointChargeAmount: 0
	};
	if (currentPoint >= bookRevision.buy_point) {
		const { dbError: dbBookBuyError } = await dbBookBuyCreate(dbBookBuyCreateReq);
		if (dbBookBuyError) {
			return error(500, { message: dbBookBuyError?.message ?? '' });
		}
		redirect(303, cancelUrl);
	}

	// Currency specification is required for payment process
	const requestCurrency = url.searchParams.get(paymentCurrencyParam) as CurrencySupportCodes | null;
	if (!requestCurrency || !getCurrencyData(requestCurrency)) {
		return error(400, { message: 'Currency must be specified.' });
	}

	// Need 100 USD + service fee to buy 100 point
	const pointAmountBase = (bookRevision.buy_point / 100) * (100 / (100 - chargeFee));
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

	const { paymentContracts, dbError: dbContractGetError } = await dbUserPaymentContractGet({
		userId: signInUser.id,
		providerKey: 'stripe'
	});
	if (!paymentContracts || dbContractGetError) {
		return error(500, { message: dbContractGetError?.message ?? '' });
	}
	const paymentCustomerId = decryptFromFlat(
		paymentContracts.at(0)?.provider_customer_id ?? '',
		env.ENCRYPT_PAYMENT_CUSTOMER_ID,
		env.ENCRYPT_SALT
	);

	// If do not have enough points, use Stripe Checkout.
	// Need 456 points → charge 456 points
	// Need 8000 points → charge 8000 points
	dbBookBuyCreateReq.beforePointChargeAmount = bookRevision.buy_point;
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
		requestCurrency as CurrencySupportCodes,
		paymentAmount,
		paymentCustomerId,
		userEmail,
		afterPaymentUrl.href,
		cancelUrl
	);

	redirect(303, paymentSession.url ?? cancelUrl);
};
