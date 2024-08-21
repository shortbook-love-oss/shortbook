import { error, redirect } from '@sveltejs/kit';
import { dbCurrencyRateUpsert, type DbCurrencyRateUpsertRequest } from '$lib/model/currency/upsert';
import { fetchCurrencyRates } from '$lib/utilities/server/currency';
import {
	currencySupportKeys,
	defaultCurrency,
	type CurrencySupportKeys
} from '$lib/utilities/currency';

export const load = async () => {
	// Show book price by all supported currencies
	const currencyRates = await fetchCurrencyRates(defaultCurrency.key);
	const rates: DbCurrencyRateUpsertRequest['rates'] = [];
	for (const currency in currencyRates) {
		const cur = currency as CurrencySupportKeys;
		if (!currencySupportKeys.includes(cur)) {
			continue;
		}
		if (currencyRates[cur]) {
			rates.push({
				currency: cur,
				rate: currencyRates[cur]
			});
		}
	}

	const { dbError } = await dbCurrencyRateUpsert({ rates });
	if (dbError) {
		return error(500, { message: dbError.message });
	}

	redirect(301, '/');
};
