import {
	currencySupports,
	formatPrice,
	getCurrencyData,
	getLocalizedPrice,
	type CurrencySupportValues
} from '$lib/utilities/currency';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import type { SelectItem } from '$lib/utilities/select';

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

// return [
// 	 { value: 'usd', label: '$1.09' },
// 	 { value: 'eur', label: '€1.00' },
//   ...
// ]
export function calcPriceByPoint(
	currencyConverted: Partial<Record<CurrencySupportValues, number>>,
	requestLang: AvailableLanguageTags
) {
	const currencyPreviews: SelectItem<CurrencySupportValues>[] = [];
	for (const currencyData of currencySupports) {
		const convertedPrice = currencyConverted[currencyData.value];
		if (convertedPrice) {
			const priceWithFee = getLocalizedPrice(
				convertedPrice * (100 / (100 - chargeFee)),
				currencyData.allowDecimal && !currencyData.rule00
			);
			currencyPreviews.push({
				value: currencyData.value,
				label: formatPrice(priceWithFee, currencyData.value, requestLang)
			});
		}
	}

	return currencyPreviews;
}

export function toPaymentAmountOfStripe(currency: CurrencySupportValues, originAmount: number) {
	const currencyData = getCurrencyData(currency);
	if (!currencyData) {
		return null;
	}
	if (currencyData.rule00) {
		if (currencyData.allowDecimal) {
			// "45600" Only used by ISK (Island)
			return String(Math.floor(originAmount) * 100);
		} else {
			// "45600" Only used by UGX (Uganda)
			// The currency rate is high, so it is not divided by 100
			return String(Math.floor(originAmount) * 100);
		}
	} else {
		if (currencyData.allowDecimal) {
			// "45678"
			return String(Math.floor(originAmount * 100));
		} else {
			// "456"
			return String(Math.floor(originAmount));
		}
	}
}

// Stripe's return amount value to actually amount
export function reversePaymentAmountOfStripe(currency: CurrencySupportValues, savedAmount: number) {
	const currencyData = getCurrencyData(currency);
	if (!currencyData || Number.isNaN(Number(savedAmount))) {
		return undefined;
	}
	if (currencyData.rule00) {
		if (currencyData.allowDecimal) {
			return savedAmount / 100;
		} else {
			return savedAmount / 100;
		}
	} else {
		if (currencyData.allowDecimal) {
			return savedAmount / 100;
		} else {
			return savedAmount;
		}
	}
}
