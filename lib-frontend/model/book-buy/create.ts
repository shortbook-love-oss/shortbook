import prisma from '$lib/prisma/connect';

export interface DbBookBuyCreateRequest {
	bookId: string;
	writeUserId: string;
	userId: string;
	pointSpend: number;
	// For point charge
	beforePointChargeAmount: number;
	paymentSessionId: string;
}

export async function dbBookBuyCreate(req: DbBookBuyCreateRequest) {
	// Increment created_at/updated_at for sort
	const createdAt = new Date();
	let dbError: Error | undefined;

	await prisma
		.$transaction(async (tx) => {
			if (req.beforePointChargeAmount) {
				// Reader's point charge
				await tx.user_points.create({
					data: {
						user_id: req.userId,
						amount: req.beforePointChargeAmount,
						book_id: '',
						payment_session_id: req.paymentSessionId,
						created_at: createdAt,
						updated_at: createdAt
					}
				});
				createdAt.setMilliseconds(createdAt.getMilliseconds() + 1);
			}
			// Writer's point charge
			await tx.user_points.create({
				data: {
					user_id: req.writeUserId,
					amount: req.pointSpend,
					book_id: req.bookId,
					payment_session_id: '',
					created_at: createdAt,
					updated_at: createdAt
				}
			});
			createdAt.setMilliseconds(createdAt.getMilliseconds() + 1);
			// Reader's point spend
			await tx.user_points.create({
				data: {
					user_id: req.userId,
					amount: -req.pointSpend,
					book_id: req.bookId,
					payment_session_id: '',
					created_at: createdAt,
					updated_at: createdAt
				}
			});
			await tx.book_buys.create({
				data: {
					book_id: req.bookId,
					user_id: req.userId,
					point_spend: req.pointSpend,
					created_at: createdAt,
					updated_at: createdAt
				}
			});
		})
		.catch(() => {
			dbError ??= new Error(`Failed to buy books. User ID=${req.userId} and Book ID=${req.bookId}`);
			return undefined;
		});

	return { dbError };
}
