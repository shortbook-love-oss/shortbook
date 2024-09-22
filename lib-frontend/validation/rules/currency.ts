import { currencySupports } from '$lib/utilities/currency';

export function validateOptionalCurrencyCode(value: string) {
	if (!value) {
		return true;
	}
	return currencySupports.some((c) => c.value === value);
}
