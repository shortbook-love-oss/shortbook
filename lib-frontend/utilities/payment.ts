import {
	currencyDisallowDecimalList,
	currencyMultiple100List,
	formatPrice,
	getCurrencyData,
	getLocalizedPrice,
	type CurrencySupportCodes
} from '$lib/utilities/currency';
import type { AvailableLanguageTags } from '$lib/utilities/language';

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

export function getAccuratePaymentPrice(
	basePrice: number | undefined,
	currencyCode: CurrencySupportCodes,
	formatLang: AvailableLanguageTags
) {
	const currencyData = getCurrencyData(currencyCode);
	if (!basePrice || !currencyData) {
		return null;
	}

	const isAllowDecimal = !(currencyDisallowDecimalList as string[]).includes(currencyCode);
	const isMultiple100 = (currencyMultiple100List as string[]).includes(currencyCode);
	const priceWithFee = getLocalizedPrice(basePrice, isAllowDecimal && !isMultiple100);
	// e.g. $3.26 , €2.91 , KES 419.45
	const formattedPrice = formatPrice(priceWithFee, currencyData.value, formatLang);

	return {
		value: currencyData.value,
		label: currencyData.label,
		text: formattedPrice
	};
}

export function toPaymentAmountOfStripe(currency: CurrencySupportCodes, originAmount: number) {
	const currencyData = getCurrencyData(currency);
	if (!currencyData) {
		return null;
	}
	const isAllowDecimal = !(currencyDisallowDecimalList as string[]).includes(currencyData.value);
	const isMultiple100 = (currencyMultiple100List as string[]).includes(currencyData.value);
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
export function reversePaymentAmountOfStripe(currency: CurrencySupportCodes, savedAmount: number) {
	const currencyData = getCurrencyData(currency);
	if (!currencyData || Number.isNaN(Number(savedAmount))) {
		return undefined;
	}
	const isAllowDecimal = !(currencyDisallowDecimalList as string[]).includes(currencyData.value);
	const isMultiple100 = (currencyMultiple100List as string[]).includes(currencyData.value);
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
