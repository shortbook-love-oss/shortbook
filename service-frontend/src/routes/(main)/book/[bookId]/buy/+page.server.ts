import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dbBookBuyPointGet } from '$lib/model/book/get-buy-point';
import { dbBookBuyCreate, type DbBookBuyCreateRequest } from '$lib/model/book_buy/create';
import { dbBookBuyGet } from '$lib/model/book_buy/get';
import { dbUserPointList } from '$lib/model/user/point/list';
import { encryptAndFlat } from '$lib/utilities/server/crypto';
import { createPaymentSession } from '$lib/utilities/server/payment';
import { redirectToSignInPage } from '$lib/utilities/server/url';
import {
	getLanguageTagFromUrl,
	paymentBookInfoParam,
	setLanguageTagToPath
} from '$lib/utilities/url';

export const load = async ({ url, params, locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return redirectToSignInPage(url);
	}
	const requestLang = getLanguageTagFromUrl(url);
	const bookId = params.bookId;

	const callbackUrl =
		url.origin + setLanguageTagToPath(`/book/${bookId}${url.search}`, requestLang);

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
	const { book, dbError: dbBookPointError } = await dbBookBuyPointGet({ bookId });
	if (!book || dbBookPointError) {
		return error(500, { message: dbBookPointError?.message ?? '' });
	}

	// If users can pay with the points they have, use it
	const dbBookBuyCreateReq: DbBookBuyCreateRequest = {
		bookId,
		writeUserId: book.user_id,
		userId,
		pointSpend: book.buy_point,
		beforePointChargeAmount: 0,
		paymentSessionId: ''
	};
	if (currentPoint >= book.buy_point) {
		const { dbError: dbBookBuyError } = await dbBookBuyCreate(dbBookBuyCreateReq);
		if (dbBookBuyError) {
			return error(500, { message: dbBookBuyError?.message ?? '' });
		}
		redirect(303, callbackUrl);
	}

	// Multiple of 100, and amount that can be buy
	// Need 456 points → charge 500 points
	// Need 8000 points → charge 8000 points
	dbBookBuyCreateReq.beforePointChargeAmount =
		Math.ceil((book.buy_point - currentPoint) / 100) * 100;

	// If do not have enough points, use Stripe Checkout.
	// 1 order → 100 points
	// (dbBookBuyCreateReq.beforePointChargeAmount / 100) order → dbBookBuyCreateReq.beforePointChargeAmount points
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
		env.STRIPE_PRICE_ID_POINT_CHARGE,
		dbBookBuyCreateReq.beforePointChargeAmount / 100,
		afterPaymentUrl.href,
		callbackUrl
	);

	redirect(303, paymentSession.url ?? '');
};
