import {
	currencyDisallowDecimalList,
	currencyMultiple100List,
	getLocalizedPrice,
	type CurrencySupportCodes
} from '$lib/utilities/currency';

// Service fee is 8%
export const chargeFee = 8;

export const paymentProviders = [{ key: 'stripe', label: 'Stripe' }] as const;

export function getPaymentProvider(key: string) {
	for (const provider of paymentProviders) {
		if (provider.key === key) {
			return provider;
		}
	}
	return null;
}

export function getAccuratePaymentPrice(basePrice: number, currencyCode: CurrencySupportCodes) {
	const isAllowDecimal = !(currencyDisallowDecimalList as string[]).includes(currencyCode);
	const isMultiple100 = (currencyMultiple100List as string[]).includes(currencyCode);
	const localizedPrice = getLocalizedPrice(basePrice, isAllowDecimal && !isMultiple100);

	return localizedPrice;
}

export function toPaymentAmountOfStripe(originAmount: number, currencyCode: CurrencySupportCodes) {
	const isAllowDecimal = !(currencyDisallowDecimalList as string[]).includes(currencyCode);
	const isMultiple100 = (currencyMultiple100List as string[]).includes(currencyCode);
	if (isMultiple100) {
		if (isAllowDecimal) {
			// "45600" Only used by ISK (Island)
			return String(Math.floor(originAmount) * 100);
		} else {
			// "45600" Only used by UGX (Uganda)
			// The currency rate is high, so it is not divided by 100
			return String(Math.floor(originAmount) * 100);
		}
	} else {
		if (isAllowDecimal) {
			// "45678"
			return String(Math.floor(originAmount * 100));
		} else {
			// "456"
			return String(Math.floor(originAmount));
		}
	}
}

// Stripe's return amount value to actually amount
export function reversePaymentAmountOfStripe(
	savedAmount: number,
	currencyCode: CurrencySupportCodes
) {
	const isAllowDecimal = !(currencyDisallowDecimalList as string[]).includes(currencyCode);
	const isMultiple100 = (currencyMultiple100List as string[]).includes(currencyCode);
	if (isMultiple100) {
		if (isAllowDecimal) {
			return savedAmount / 100;
		} else {
			return savedAmount / 100;
		}
	} else {
		if (isAllowDecimal) {
			return savedAmount / 100;
		} else {
			return savedAmount;
		}
	}
}
