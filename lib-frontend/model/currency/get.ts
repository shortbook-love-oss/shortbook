import prisma from '$lib/prisma/connect';
import { currencySupportKeys, type CurrencySupportKeys } from '$lib/utilities/currency';

export interface DbCurrencyRateGetRequest {
	amount: number;
}

export async function dbCurrencyRateGet(req: DbCurrencyRateGetRequest) {
	let dbError: Error | undefined;

	const currencyRates = await prisma.currency_rates.findMany().catch(() => {
		dbError ??= new Error(`Failed to get currency rates.`);
		return undefined;
	});

	const currencyRateIndex: Partial<Record<CurrencySupportKeys, number>> = {};
	if (currencyRates) {
		for (const currency of currencyRates) {
			const currencyKey = currency.currency as CurrencySupportKeys;
			if (currencySupportKeys.includes(currencyKey)) {
				currencyRateIndex[currencyKey] = req.amount * currency.rate.toNumber();
			}
		}
	}

	return { currencyRates, currencyRateIndex, dbError };
}
