import prisma from '$lib/prisma/connect';

export interface DbBookBuyDeleteRequest {
	bookId: string;
	userId: string;
}

export async function dbBookBuyDelete(req: DbBookBuyDeleteRequest) {
	let dbError: Error | undefined;

	await prisma
		.$transaction(async (tx) => {
			const deletedAt = new Date();
			const buyHistory = await tx.book_buys.findFirst({
				where: {
					book_id: req.bookId,
					user_id: req.userId
				}
			});
			if (!buyHistory) {
				dbError ??= new Error(
					`Didn't buy book or refunded. User ID=${req.userId} and Book ID=${req.bookId}`
				);
				return undefined;
			}
			await tx.user_points.create({
				data: {
					user_id: req.userId,
					amount: buyHistory.point_spend,
					book_id: req.bookId,
					payment_session_id: ''
				}
			});
			await tx.book_buys.updateMany({
				where: {
					book_id: req.bookId,
					user_id: req.userId
				},
				data: {
					deleted_at: deletedAt
				}
			});
		})
		.catch(() => {
			dbError ??= new Error(
				`Failed to refund books. User ID=${req.userId} and Book ID=${req.bookId}`
			);
			return undefined;
		});

	return { dbError };
}
