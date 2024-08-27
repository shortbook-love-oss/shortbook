import type { user_payment_checkouts } from '@prisma/client';
import prisma from '$lib/prisma/connect';
import type { paymentProviders } from '$lib/utilities/payment';

export interface DbUserPaymentCheckoutCreateRequest {
	provider: (typeof paymentProviders)[number]['key'];
	sessionId: string;
	currency: string;
	amount: number;
}

export interface DbUserPointCreateRequest {
	userId: string;
	paymentCheckoutId?: string;
	amount: number;
	bookId?: string;
	// For point charge
	payment?: DbUserPaymentCheckoutCreateRequest;
}

export async function dbUserPointCreate(req: DbUserPointCreateRequest) {
	let dbError: Error | undefined;

	const userPoint = await prisma
		.$transaction(async (tx) => {
			let checkout: user_payment_checkouts | undefined;
			if (req.payment) {
				// Reader's point charge
				checkout = await tx.user_payment_checkouts.create({
					data: {
						user_id: req.userId,
						provider_key: req.payment.provider,
						session_id: req.payment.sessionId,
						currency: req.payment.currency,
						amount: req.payment.amount,
						is_refund: 0
					}
				});
			}
			const userPoint = await tx.user_points.create({
				data: {
					user_id: req.userId,
					payment_checkout_id: checkout?.id ?? '',
					amount: req.amount,
					book_id: req.bookId ?? '',
					is_refund: 0,
					is_sell: 0,
					is_income: 0
				}
			});

			return userPoint;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to create user point history. User ID=${req.userId}`);
			return undefined;
		});

	return { userPoint, dbError };
}
