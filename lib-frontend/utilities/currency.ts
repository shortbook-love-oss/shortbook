// Note allowDecimal: Some currencies do not support decimal points
// In those cases, the specification is not to multiply by 100
// https://docs.stripe.com/currencies#zero-decimal
// Note rule00: see https://docs.stripe.com/currencies#special-cases
export const currencySupports = [
	{ key: 'usd', label: 'USD', allowDecimal: true, rule00: false },
	{ key: 'eur', label: 'EUR', allowDecimal: true, rule00: false },
	{ key: 'inr', label: 'INR', allowDecimal: true, rule00: false },
	{ key: 'jpy', label: 'JPY', allowDecimal: false, rule00: false },
	{ key: 'aud', label: 'AUD', allowDecimal: true, rule00: false },
	{ key: 'rub', label: 'RUB', allowDecimal: true, rule00: false },
	{ key: 'bam', label: 'BAM', allowDecimal: true, rule00: false },
	{ key: 'isk', label: 'ISK', allowDecimal: true, rule00: true },
	{ key: 'huf', label: 'HUF', allowDecimal: true, rule00: false },
	{ key: 'twd', label: 'TWD', allowDecimal: true, rule00: false },
	{ key: 'ugx', label: 'UGX', allowDecimal: false, rule00: true }
] as const;

export const defaultCurrency = currencySupports[0];

export function getCurrencyData(key: string) {
	for (const currency of currencySupports) {
		if (currency.key === key) {
			return currency;
		}
	}
	return null;
}

export type CurrencySupportKeys = (typeof currencySupports)[number]['key'];
