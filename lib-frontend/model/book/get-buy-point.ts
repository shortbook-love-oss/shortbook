import prisma from '$lib/prisma/connect';

export interface DbBookBuyPointGetRequest {
	bookId: string;
}

export async function dbBookBuyPointGet(req: DbBookBuyPointGetRequest) {
	let dbError: Error | undefined;

	const book = await prisma.books
		.findUnique({
			where: {
				id: req.bookId,
				deleted_at: null
			},
			select: {
				id: true,
				buy_point: true
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get book buy point. Book ID=${req.bookId}`);
			return undefined;
		});

	return { book, dbError };
}
