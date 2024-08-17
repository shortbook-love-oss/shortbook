import type { AvailableLanguageTags } from '$lib/utilities/language';
import type { SelectItem } from '$lib/utilities/select';

// Note allowDecimal: Some currencies do not support decimal points
// In those cases, the specification is not to multiply by 100
// https://docs.stripe.com/currencies#zero-decimal
// Note rule00: see https://docs.stripe.com/currencies#special-cases
export const currencySupports = [
	{ key: 'usd', label: 'USD', allowDecimal: true, rule00: false },
	{ key: 'eur', label: 'EUR', allowDecimal: true, rule00: false },
	{ key: 'aed', label: 'AED', allowDecimal: true, rule00: false },
	{ key: 'inr', label: 'INR', allowDecimal: true, rule00: false },
	{ key: 'cny', label: 'CNY', allowDecimal: true, rule00: false },
	{ key: 'twd', label: 'TWD', allowDecimal: true, rule00: false },
	{ key: 'jpy', label: 'JPY', allowDecimal: false, rule00: false },
	{ key: 'aud', label: 'AUD', allowDecimal: true, rule00: false },
	{ key: 'rub', label: 'RUB', allowDecimal: true, rule00: false },
	{ key: 'brl', label: 'BRL', allowDecimal: true, rule00: false },
	{ key: 'bam', label: 'BAM', allowDecimal: true, rule00: false },
	{ key: 'isk', label: 'ISK', allowDecimal: true, rule00: true },
	{ key: 'huf', label: 'HUF', allowDecimal: true, rule00: false },
	{ key: 'ugx', label: 'UGX', allowDecimal: false, rule00: true }
] as const;

export const defaultCurrency = currencySupports[0];

export const currencySupportKeys = currencySupports.map((currency) => currency.key);

export type CurrencySupportKeys = (typeof currencySupports)[number]['key'];

export const currencySelect: SelectItem<CurrencySupportKeys>[] = currencySupports.map(
	(currency) => ({
		value: currency.key,
		label: currency.label
	})
);

export const currencyAndNoSelect: SelectItem<CurrencySupportKeys | ''>[] = [
	{ value: '', label: 'Select at each payment' },
	...currencySelect
];

export function getCurrencyData(key: string) {
	for (const currency of currencySupports) {
		if (currency.key === key) {
			return currency;
		}
	}
	return null;
}

export function guessCurrencyByLang(langTag: AvailableLanguageTags) {
	let suggestCurrency: CurrencySupportKeys = defaultCurrency.key;
	switch (langTag) {
		case 'en':
			suggestCurrency = 'usd';
			break;
		case 'fr':
		case 'de':
		case 'es':
		case 'it':
			suggestCurrency = 'eur';
			break;
		case 'ar-ae':
			suggestCurrency = 'aed';
			break;
		case 'hi':
			suggestCurrency = 'inr';
			break;
		case 'zh-cn':
			suggestCurrency = 'cny';
			break;
		case 'zh-tw':
			suggestCurrency = 'twd';
			break;
		case 'ja':
			suggestCurrency = 'jpy';
			break;
		case 'ru':
			suggestCurrency = 'rub';
			break;
		case 'pt-br':
			suggestCurrency = 'brl';
			break;
	}

	return suggestCurrency;
}

// USD 1.49 → 1.49 (ok)
// USD 1.493 → 1.49 (should be to two decimal places)
// JPY 78.9 → 78 (not allow decimal)
export function getLocalizedPrice(originPrice: number, isAllowDecimal: boolean) {
	if (isAllowDecimal) {
		return Math.floor(originPrice * 100) / 100;
	} else {
		return Math.floor(originPrice);
	}
}

// 20.25 → €20.25
export function formatPrice(
	amount: number,
	currency: CurrencySupportKeys,
	requestLang: AvailableLanguageTags
) {
	return new Intl.NumberFormat(requestLang, {
		style: 'currency',
		currency,
		minimumFractionDigits: 0
	}).format(amount);
}
