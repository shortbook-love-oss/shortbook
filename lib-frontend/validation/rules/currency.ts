import { currencySupports } from '$lib/utilities/currency';

export function validateCurrencyCode(value: string) {
	return currencySupports.some((c) => c.value === value);
}
