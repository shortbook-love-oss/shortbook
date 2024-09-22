import prisma from '$lib-backend/database/connect';
import { currencySupportCodes, type CurrencySupportCodes } from '$lib/utilities/currency';

export interface DbCurrencyRateGetRequest {
	amount: number;
}

export async function dbCurrencyRateGet(req: DbCurrencyRateGetRequest) {
	let dbError: Error | undefined;

	const currencyRates = await prisma.currency_rates.findMany().catch(() => {
		dbError ??= new Error(`Failed to get currency rates.`);
		return undefined;
	});

	const currencyRateIndex: Partial<Record<CurrencySupportCodes, number>> = {};
	if (currencyRates) {
		for (const currency of currencyRates) {
			const currencyCode = currency.currency as CurrencySupportCodes;
			if (currencySupportCodes.includes(currencyCode)) {
				currencyRateIndex[currencyCode] = req.amount * currency.rate.toNumber();
			}
		}
	}

	return { currencyRates, currencyRateIndex, dbError };
}
