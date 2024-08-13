import prisma from '$lib/prisma/connect';

export interface DbUserPaymentCheckoutListRequest {
	userId: string;
	checkoutIds: string[];
}

export async function dbUserPaymentCheckoutList(req: DbUserPaymentCheckoutListRequest) {
	let dbError: Error | undefined;

	const paymentCheckouts = await prisma.user_payment_checkouts
		.findMany({
			where: {
				id: { in: req.checkoutIds },
				user_id: req.userId,
				deleted_at: null
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user payment checkouts. User ID=${req.userId}`);
			return undefined;
		});

	return { paymentCheckouts, dbError };
}
