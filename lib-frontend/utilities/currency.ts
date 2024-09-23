import type { AvailableLanguageTags } from '$lib/utilities/language';
import { currencyListByGroup } from './currency-list';

// All support currency code / name / payment rules
export const currencySupports = currencyListByGroup;
export const currencySupportsFlat = currencySupports.map((group) => group.childs).flat();

export const currencySupportCodes = currencySupportsFlat.map((currency) => currency.value);
export type CurrencySupportCodes = (typeof currencySupportCodes)[number];

// Some currencies do not support decimal points
// In those cases, the specification is not to multiply by 100
// See https://docs.stripe.com/currencies#zero-decimal
export const currencyDisallowDecimalList = ['jpy', 'ugx'] as const satisfies CurrencySupportCodes[];

// See https://docs.stripe.com/currencies#special-cases
export const currencyMultiple100List = ['isk', 'ugx'] as const satisfies CurrencySupportCodes[];

export const defaultCurrencyCode = 'usd' as const satisfies CurrencySupportCodes;

export function getCurrencyData(key: string) {
	for (const currency of currencySupportsFlat) {
		if (currency.value === key) {
			return currency;
		}
	}
	return null;
}

export function guessCurrencyByLang(langTag: AvailableLanguageTags) {
	let suggestCurrency: CurrencySupportCodes = defaultCurrencyCode;
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
