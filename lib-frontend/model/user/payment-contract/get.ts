import prisma from '$lib/prisma/connect';
import { paymentProviders } from '$lib/utilities/payment';

export interface DbUserPaymentContractGetRequest {
	userId: string;
	providerKey: (typeof paymentProviders)[number]['key'];
}

export async function dbUserPaymentContractGet(req: DbUserPaymentContractGetRequest) {
	let dbError: Error | undefined;

	const paymentContracts = await prisma.user_payment_contracts
		.findMany({
			where: {
				user_id: req.userId,
				provider_key: req.providerKey,
				deleted_at: null
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user payment reference. User ID=${req.userId}`);
			return undefined;
		});

	return { paymentContracts, dbError };
}
