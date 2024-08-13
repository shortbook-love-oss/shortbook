import prisma from '$lib/prisma/connect';

export interface DbBookBuyGetRequest {
	bookId: string;
	userId: string;
}

export async function dbBookBuyGet(req: DbBookBuyGetRequest) {
	let dbError: Error | undefined;

	const bookBuy = await prisma
		.$transaction(async (tx) => {
			const bookBuy = await tx.book_buys.findFirst({
				where: {
					book_id: req.bookId,
					user_id: req.userId,
					deleted_at: null
				}
			});
			return bookBuy;
		})
		.catch(() => {
			dbError ??= new Error(
				`Failed to get book buy history. User ID=${req.userId} and Book ID=${req.bookId}`
			);
			return undefined;
		});

	return { bookBuy, dbError };
}
