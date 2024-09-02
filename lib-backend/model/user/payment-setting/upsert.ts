import prisma from '$lib-backend/database/connect';
import type { CurrencySupportKeys } from '$lib/utilities/currency';

export interface DbUserPaymentSettingUpsertRequest {
	userId: string;
	currencyKey: CurrencySupportKeys;
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
				currency: req.currencyKey
			},
			update: {
				currency: req.currencyKey
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to update user payment setting. User ID=${req.userId}`);
			return undefined;
		});

	return { paymentSetting, dbError };
}
