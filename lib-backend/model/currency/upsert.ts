import prisma from '$lib-backend/database/connect';
import type { CurrencySupportValues } from '$lib/utilities/currency';

export interface DbCurrencyRateUpsertRequest {
	rates: {
		currency: CurrencySupportValues;
		rate: number;
	}[];
}

export async function dbCurrencyRateUpsert(req: DbCurrencyRateUpsertRequest) {
	let dbError: Error | undefined;

	const currencyRates = await prisma
		.$transaction(async (tx) => {
			await tx.currency_rates.deleteMany();
			const currencyRates = await tx.currency_rates.createMany({
				data: req.rates
			});
			return currencyRates;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to update currency rates.`);
			return undefined;
		});

	return { currencyRates, dbError };
}
