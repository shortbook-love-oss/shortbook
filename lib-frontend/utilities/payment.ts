import {
	currencySupportKeys,
	currencySupports,
	formatPrice,
	getCurrencyData,
	getLocalizedPrice,
	type CurrencySupportKeys
} from '$lib/utilities/currency';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import type { SelectItem } from '$lib/utilities/select';

// Service fee is 8%
export const shortbookChargeFee = 8;

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
	currencyConverted: Partial<Record<CurrencySupportKeys, number>>,
	requestLang: AvailableLanguageTags
) {
	const currencyPreviews: SelectItem<CurrencySupportKeys>[] = [];
	for (const currencyData of currencySupports) {
		const convertedPrice = currencyConverted[currencyData.key];
		if (convertedPrice) {
			const priceWithFee = getLocalizedPrice(
				convertedPrice * (100 / (100 - shortbookChargeFee)),
				currencyData.allowDecimal && !currencyData.rule00
			);
			currencyPreviews.push({
				value: currencyData.key,
				label: formatPrice(priceWithFee, currencyData.key, requestLang)
			});
		}
	}

	return currencyPreviews;
}

// Payment request ... $100 * (100 / (100 - shortbookChargeFee)) → 10,000 points
// Any fractional amounts invoiced will be rounded down
export async function decidePaymentAmountForStripe(
	currencyConverted: Partial<Record<CurrencySupportKeys, number>>
) {
	const amountByCurrencies: Partial<Record<CurrencySupportKeys, string>> = {};
	for (const wantCurrency of currencySupportKeys) {
		const currencyData = getCurrencyData(wantCurrency);
		if (!currencyData) {
			continue;
		}
		amountByCurrencies[currencyData.key] = toPaymentAmountOfStripe(
			currencyData,
			currencyConverted[currencyData.key] as number
		);
	}

	return amountByCurrencies;
}

function toPaymentAmountOfStripe(
	currencyData: (typeof currencySupports)[number],
	originAmount: number
) {
	if (currencyData.rule00) {
		if (currencyData.allowDecimal) {
			// "45600" Only used by ISK (Island)
			return String(Math.floor(originAmount * 100) * 100);
		} else {
			// "45600" Only used by UGX (Uganda)
			// The currency rate is high, so it is not divided by 100
			return String(Math.floor(originAmount * 100) * 100);
		}
	} else {
		if (currencyData.allowDecimal) {
			// "45678"
			return String(Math.floor(originAmount * 10000));
		} else {
			// "456"
			return String(Math.floor(originAmount * 100));
		}
	}
}

// Stripe's return amount value to actually amount
export function reversePaymentAmountOfStripe(currency: CurrencySupportKeys, savedAmount: number) {
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
