import prisma from '$lib-backend/database/connect';
import { currencySupportValues, type CurrencySupportValues } from '$lib/utilities/currency';

export interface DbCurrencyRateGetRequest {
	amount: number;
}

export async function dbCurrencyRateGet(req: DbCurrencyRateGetRequest) {
	let dbError: Error | undefined;

	const currencyRates = await prisma.currency_rates.findMany().catch(() => {
		dbError ??= new Error(`Failed to get currency rates.`);
		return undefined;
	});

	const currencyRateIndex: Partial<Record<CurrencySupportValues, number>> = {};
	if (currencyRates) {
		for (const currency of currencyRates) {
			const currencyKey = currency.currency as CurrencySupportValues;
			if (currencySupportValues.includes(currencyKey)) {
				currencyRateIndex[currencyKey] = req.amount * currency.rate.toNumber();
			}
		}
	}

	return { currencyRates, currencyRateIndex, dbError };
}
