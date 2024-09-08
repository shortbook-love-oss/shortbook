import type { user_payment_checkouts } from '@prisma/client';
import { error } from '@sveltejs/kit';
import { dbBookList } from '$lib-backend/model/book/list';
import { dbUserPaymentCheckoutList } from '$lib-backend/model/user/payment-checkout/list';
import { dbUserPointList } from '$lib-backend/model/user/point/list';
import type { CurrencySupportKeys } from '$lib/utilities/currency';
import type { PointListItem } from '$lib/utilities/point';
import { getLanguageTagFromUrl } from '$lib/utilities/url';

export const load = async ({ url, locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}
	const requestLang = getLanguageTagFromUrl(url);

	const {
		userPointHistories,
		currentPoint,
		dbError: dbPointListError
	} = await dbUserPointList({ userId });
	if (!userPointHistories || dbPointListError) {
		return error(500, { message: dbPointListError?.message ?? '' });
	}

	const checkoutIds = userPointHistories
		.map((history) => history.payment_checkout_id)
		.filter(Boolean);
	const paymentCheckoutMap: Record<string, user_payment_checkouts> = {};
	if (checkoutIds.length) {
		const { paymentCheckouts, dbError } = await dbUserPaymentCheckoutList({
			userId,
			checkoutIds: checkoutIds
		});
		if (!paymentCheckouts || dbError) {
			return error(500, { message: dbError?.message ?? '' });
		}
		for (const checkout of paymentCheckouts) {
			paymentCheckoutMap[checkout.id] = checkout;
		}
	}

	// Include bought books
	const userPointBookIds = userPointHistories.map((history) => history.book_id);
	const pointBooksMap: Record<
		string,
		NonNullable<Awaited<ReturnType<typeof dbBookList>>['books']>[number]
	> = {};
	if (userPointBookIds.length) {
		const { books, dbError: dbBookListError } = await dbBookList({
			bookIds: userPointBookIds,
			isIncludeDraft: true,
			isIncludeDelete: true
		});
		if (!books || dbBookListError) {
			return error(500, { message: dbBookListError?.message ?? '' });
		}
		books.forEach((book) => {
			pointBooksMap[book.id] = book;
		});
	}

	// Brend point and book data
	const pointList: PointListItem[] = userPointHistories.map((point) => {
		let bookTitle = '';
		const book = pointBooksMap[point.book_id];
		if (point.book_id && book) {
			let bookLang = book.languages.find((lang) => lang.language_code === requestLang);
			if (!bookLang && book.languages.length) {
				bookLang = book.languages[0];
			}
			bookTitle = bookLang?.title ?? '';
		}
		const checkout = paymentCheckoutMap[point.payment_checkout_id];
		const pointItem: PointListItem = {
			amount: point.amount,
			createdAt: point.created_at,
			bookTitle,
			bookKeyName: book?.key_name ?? '',
			writeKeyName: book?.user.profiles?.key_name ?? '',
			isSell: point.is_sell > 0
		};
		if (checkout) {
			pointItem.payment = {
				provider: checkout.provider_key,
				currency: checkout.currency.toLowerCase() as CurrencySupportKeys,
				amount: checkout.amount.toNumber()
			};
		}

		return pointItem;
	});

	return { pointList, currentPoint, userPointHistories };
};
