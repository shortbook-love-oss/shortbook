import type { CurrencySupportKeys } from '$lib/utilities/currency';

export async function getConvertedCurrencies(
	baseAmount: number,
	fromCurrency: CurrencySupportKeys,
	wantCurrencies: CurrencySupportKeys[]
) {
	// Convert to other currencies by https://github.com/fawazahmed0/exchange-api
	// Currency rates updated daily at 12:00 UTC
	// {
	// 	date: '2024-08-10',
	// 	usd: {
	// 		aave: 0.010465462,
	// 		abt: 0.6636949,
	// 		...
	// 	}
	// }
	let result = await fetch(
		`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency}.json`
	)
		.then((res) => res.json())
		.catch(() => null);
	if (!result) {
		// Fallback if cdn down
		await fetch(`https://latest.currency-api.pages.dev/v1/currencies/${fromCurrency}.json`)
			.then((res) => res.json())
			.catch(() => null);
	}

	const matchCurrencies: Partial<Record<CurrencySupportKeys, number>> = {};
	if (result?.usd) {
		const resultFrom: Record<string, number> = result.usd;
		for (const wantCurrency of wantCurrencies) {
			if (Object.hasOwn(resultFrom, wantCurrency)) {
				matchCurrencies[wantCurrency] = (baseAmount / 100) * resultFrom[wantCurrency];
			}
		}
	}

	return matchCurrencies;
}
