import prisma from '$lib/prisma/connect';
import type { paymentProviders } from '$lib/utilities/payment';

export interface DbBookBuyCreateRequest {
	bookId: string;
	writeUserId: string;
	userId: string;
	pointSpend: number;
	// For point charge
	beforePointChargeAmount: number;
	payment?: {
		provider: (typeof paymentProviders)[number]['key'];
		sessionId: string;
		currency: string;
		amount: number;
	};
}

export async function dbBookBuyCreate(req: DbBookBuyCreateRequest) {
	// Increment created_at/updated_at for sort
	const createdAt = new Date();
	let dbError: Error | undefined;

	await prisma
		.$transaction(async (tx) => {
			if (req.payment) {
				// Reader's point charge
				const checkout = await tx.user_payment_checkouts.create({
					data: {
						user_id: req.userId,
						provider_key: req.payment.provider,
						session_id: req.payment.sessionId,
						currency: req.payment.currency,
						amount: req.payment.amount,
						is_refund: 0,
						created_at: createdAt,
						updated_at: createdAt
					}
				});
				await tx.user_points.create({
					data: {
						user_id: req.userId,
						payment_checkout_id: checkout.id,
						amount: req.beforePointChargeAmount,
						book_id: '',
						is_refund: 0,
						is_sell: 0,
						is_income: 0,
						created_at: createdAt,
						updated_at: createdAt
					}
				});
				createdAt.setMilliseconds(createdAt.getMilliseconds() + 1);
			}
			// Reader's point spend
			await tx.user_points.create({
				data: {
					user_id: req.userId,
					payment_checkout_id: '',
					amount: -req.pointSpend,
					book_id: req.bookId,
					is_refund: 0,
					is_sell: 0,
					is_income: 0,
					created_at: createdAt,
					updated_at: createdAt
				}
			});
			// Writer's point charge
			await tx.user_points.create({
				data: {
					user_id: req.writeUserId,
					payment_checkout_id: '',
					amount: req.pointSpend,
					book_id: req.bookId,
					is_refund: 0,
					is_sell: 1,
					is_income: 0,
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
