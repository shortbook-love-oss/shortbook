import { error } from '@sveltejs/kit';
import { dbBookList } from '$lib/model/book/list';
import { dbUserPointList } from '$lib/model/user/point/list';
import type { PointListItem } from '$lib/utilities/point';
import { getLanguageTagFromUrl } from '$lib/utilities/url';

export const load = async ({ url, locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}
	const requestLang = getLanguageTagFromUrl(url);

	const { userPointHistories, dbError: dbPointListError } = await dbUserPointList({ userId });
	if (!userPointHistories || dbPointListError) {
		return error(500, { message: dbPointListError?.message ?? '' });
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
			isIncludeDelete: true
		});
		if (!books || dbBookListError) {
			return error(500, { message: dbBookListError?.message ?? '' });
		}
		books.forEach((book) => {
			pointBooksMap[book.id] = book;
		});
	}

	// Calc current point by all transaction
	let currentPoint = 0;
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
		currentPoint += point.amount;
		return {
			amount: point.amount,
			createdAt: point.created_at,
			bookId: point.book_id,
			bookTitle,
			paymentSessionId: point.payment_session_id
		};
	});

	return { pointList, currentPoint, userPointHistories };
};
