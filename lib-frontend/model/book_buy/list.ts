import prisma from '$lib/prisma/connect';

export interface DbBookBuyListRequest {
	userId: string;
}

export async function dbBookBuyList(req: DbBookBuyListRequest) {
	let dbError: Error | undefined;

	const bookBuys = await prisma
		.$transaction(async (tx) => {
			const bookBuy = await tx.book_buys.findMany({
				where: {
					user_id: req.userId,
					deleted_at: null
				}
			});
			return bookBuy;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get book buy histories. User ID=${req.userId}`);
			return undefined;
		});

	return { bookBuys, dbError };
}
