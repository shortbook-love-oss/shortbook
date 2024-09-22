import type { AvailableLanguageTags } from '$lib/utilities/language';
import type { SelectItem } from '$lib/utilities/select';

// Note allowDecimal: Some currencies do not support decimal points
// In those cases, the specification is not to multiply by 100
// https://docs.stripe.com/currencies#zero-decimal
// Note rule00: see https://docs.stripe.com/currencies#special-cases
interface CurrencySupportItem extends SelectItem<string> {
	value: string;
	label: string;
	allowDecimal: boolean;
	rule00: boolean;
}

export const currencySupports = [
	{ value: 'usd', label: 'USD', allowDecimal: true, rule00: false },
	{ value: 'eur', label: 'EUR', allowDecimal: true, rule00: false },
	{ value: 'aed', label: 'AED', allowDecimal: true, rule00: false },
	{ value: 'inr', label: 'INR', allowDecimal: true, rule00: false },
	{ value: 'cny', label: 'CNY', allowDecimal: true, rule00: false },
	{ value: 'twd', label: 'TWD', allowDecimal: true, rule00: false },
	{ value: 'jpy', label: 'JPY', allowDecimal: false, rule00: false },
	{ value: 'aud', label: 'AUD', allowDecimal: true, rule00: false },
	{ value: 'rub', label: 'RUB', allowDecimal: true, rule00: false },
	{ value: 'brl', label: 'BRL', allowDecimal: true, rule00: false },
	{ value: 'bam', label: 'BAM', allowDecimal: true, rule00: false },
	{ value: 'isk', label: 'ISK', allowDecimal: true, rule00: true },
	{ value: 'huf', label: 'HUF', allowDecimal: true, rule00: false },
	{ value: 'ugx', label: 'UGX', allowDecimal: false, rule00: true }
] as const satisfies CurrencySupportItem[];

export const defaultCurrency = currencySupports[0];

export const currencySupportCodes = currencySupports.map((currency) => currency.value);

export type CurrencySupportCodes = (typeof currencySupports)[number]['value'];

export const currencySelect: SelectItem<CurrencySupportCodes>[] = currencySupports.map(
	(currency) => ({
		value: currency.value,
		label: currency.label
	})
);

export const currencyAndNoSelect: SelectItem<CurrencySupportCodes | ''>[] = [
	{ value: '', label: 'Select at each payment' },
	...currencySelect
];

export function getCurrencyData(key: string) {
	for (const currency of currencySupports) {
		if (currency.value === key) {
			return currency;
		}
	}
	return null;
}

export function guessCurrencyByLang(langTag: AvailableLanguageTags) {
	let suggestCurrency: CurrencySupportCodes = defaultCurrency.value;
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
	currency: CurrencySupportCodes,
	requestLang: AvailableLanguageTags
) {
	return new Intl.NumberFormat(requestLang, {
		style: 'currency',
		currency,
		minimumFractionDigits: 0
	}).format(amount);
}
