import prisma from '$lib-backend/database/connect';
import type { CurrencySupportCodes } from '$lib/utilities/currency';

export interface DbUserPaymentSettingUpsertRequest {
	userId: string;
	currencyCode: CurrencySupportCodes;
}

export async function dbUserPaymentSettingUpsert(req: DbUserPaymentSettingUpsertRequest) {
	let dbError: Error | undefined;

	const paymentSetting = await prisma.user_payment_settings
		.upsert({
			where: {
				user_id: req.userId,
				deleted_at: null
			},
			create: {
				user_id: req.userId,
				currency: req.currencyCode
			},
			update: {
				currency: req.currencyCode
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to update user payment setting. User ID=${req.userId}`);
			return undefined;
		});

	return { paymentSetting, dbError };
}
