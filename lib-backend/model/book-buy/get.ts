import prisma from '$lib-backend/database/connect';

export interface DbBookBuyGetRequest {
	bookId: string;
	userId: string;
}

export async function dbBookBuyGet(req: DbBookBuyGetRequest) {
	let dbError: Error | undefined;

	const bookBuy = await prisma.book_buys
		.findUnique({
			where: {
				book_id_user_id: {
					book_id: req.bookId,
					user_id: req.userId
				},
				deleted_at: null
			}
		})
		.catch(() => {
			dbError ??= new Error(
				`Failed to get book buy history. User ID=${req.userId} and Book ID=${req.bookId}`
			);
			return undefined;
		});

	return { bookBuy, dbError };
}
