import prisma from '$lib/prisma/connect';

export interface DbUserPaymentSettingGetRequest {
	userId: string;
}

export async function dbUserPaymentSettingGet(req: DbUserPaymentSettingGetRequest) {
	let dbError: Error | undefined;

	const paymentSetting = await prisma.user_payment_settings
		.findUnique({
			where: {
				user_id: req.userId
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user payment setting. User ID=${req.userId}`);
			return undefined;
		});

	return { paymentSetting, dbError };
}
