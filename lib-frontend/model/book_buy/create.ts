import prisma from '$lib/prisma/connect';

export interface DbBookBuyCreateRequest {
	bookId: string;
	userId: string;
	pointSpend: number;
	// For point charge
	beforePointChargeAmount: number;
	paymentSessionId: string;
}

export async function dbBookBuyCreate(req: DbBookBuyCreateRequest) {
	let dbError: Error | undefined;

	await prisma
		.$transaction(async (tx) => {
			if (req.beforePointChargeAmount) {
				await tx.user_points.create({
					data: {
						user_id: req.userId,
						amount: req.beforePointChargeAmount,
						book_id: '',
						payment_session_id: req.paymentSessionId
					}
				});
			}
			await tx.user_points.create({
				data: {
					user_id: req.userId,
					amount: -req.pointSpend,
					book_id: req.bookId,
					payment_session_id: ''
				}
			});
			await tx.book_buys.create({
				data: {
					book_id: req.bookId,
					user_id: req.userId,
					point_spend: req.pointSpend
				}
			});
		})
		.catch(() => {
			dbError ??= new Error(`Failed to buy books. User ID=${req.userId} and Book ID=${req.bookId}`);
			return undefined;
		});

	return { dbError };
}
