import prisma from '$lib/prisma/connect';
import { paymentProviders } from '$lib/utilities/payment';

export interface DbUserPaymentContractCreateRequest {
	userId: string;
	providerKey: (typeof paymentProviders)[number]['key'];
	customerId: string;
}

export async function dbUserPaymentContractCreate(req: DbUserPaymentContractCreateRequest) {
	let dbError: Error | undefined;

	const paymentContract = await prisma.user_payment_contracts
		.create({
			data: {
				user_id: req.userId,
				provider_key: req.providerKey,
				provider_customer_id: req.customerId
			}
		})
		.then((paymentContract) => {
			if (!paymentContract) {
				throw new Error();
			}
			return paymentContract;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to create user payment reference. User ID=${req.userId}`);
			return undefined;
		});

	return { paymentContract, dbError };
}
