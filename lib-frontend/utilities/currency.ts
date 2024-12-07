import { currencyListByGroup } from '$lib/utilities/currency-list';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import type { SelectItemGroup } from '$lib/utilities/select';

// All support currency code / name / payment rules
export const currencySupports = currencyListByGroup;
export const currencySupportsFlat = currencySupports.map((group) => group.childs).flat();
export const currencySupportsWithCode: SelectItemGroup<CurrencySupportCodes>[] =
	currencySupports.map((group) => {
		return {
			...group,
			childs: group.childs.map((item) => ({
				...item,
				label: `${item.value.toUpperCase()} — ${item.label}`
			}))
		};
	});

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

export function guessCurrencyByLang(langTag: AvailableLanguageTags) {
	let suggestCurrency: CurrencySupportCodes = defaultCurrencyCode;
	switch (langTag) {
		case 'en-US':
			suggestCurrency = 'usd';
			break;
		case 'ar':
			suggestCurrency = 'aed';
			break;
		case 'nb':
			suggestCurrency = 'nok';
			break;
		case 'sv':
			suggestCurrency = 'sek';
			break;
		case 'fi':
		case 'et':
		case 'es':
		case 'fr':
		case 'it':
		case 'nl':
		case 'de':
			suggestCurrency = 'eur';
			break;
		case 'da':
			suggestCurrency = 'dkk';
			break;
		case 'cs':
			suggestCurrency = 'czk';
			break;
		case 'hu':
			suggestCurrency = 'huf';
			break;
		case 'uk':
			suggestCurrency = 'uah';
			break;
		case 'ru':
			suggestCurrency = 'rub';
			break;
		case 'pt-BR':
			suggestCurrency = 'brl';
			break;
		case 'hi':
			suggestCurrency = 'inr';
			break;
		case 'zh-CN':
			suggestCurrency = 'cny';
			break;
		case 'zh-TW':
			suggestCurrency = 'twd';
			break;
		case 'ja':
			suggestCurrency = 'jpy';
			break;
		case 'ko':
			suggestCurrency = 'krw';
			break;
		case 'id':
			suggestCurrency = 'idr';
			break;
	}

	return suggestCurrency;
}
