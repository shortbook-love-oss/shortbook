import { currencySupportsFlat } from '$lib/utilities/currency';

export function validateCurrencyCode(value: string) {
	return currencySupportsFlat.some((c) => c.value === value);
}
