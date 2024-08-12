import {
	currencySupportKeys,
	currencySupports,
	getCurrencyData,
	getLocalizedPrice,
	type CurrencySupportKeys
} from '$lib/utilities/currency';
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
	requestLang: string
) {
	const currencyPreviews: SelectItem<CurrencySupportKeys>[] = [];
	for (const currencyData of currencySupports) {
		const convertedPrice = currencyConverted[currencyData.key];
		if (convertedPrice) {
			const priceWithFee = getLocalizedPrice(
				convertedPrice * (100 / (100 - shortbookChargeFee)),
				currencyData.allowDecimal && !currencyData.rule00
			);
			const l10nPrice = new Intl.NumberFormat(requestLang, {
				style: 'currency',
				currency: currencyData.label
			}).format(priceWithFee);
			currencyPreviews.push({
				value: currencyData.key,
				label: l10nPrice
			});
		}
	}

	return currencyPreviews;
}

// Payment request ... $100 * (100 / (100 - shortbookChargeFee)) → 10,000 points
// Any fractional amounts invoiced will be rounded down
export async function decidePaymentAmount(
	currencyConverted: Partial<Record<CurrencySupportKeys, number>>
) {
	const amountByCurrencies: Partial<Record<CurrencySupportKeys, string>> = {};
	for (const wantCurrency of currencySupportKeys) {
		const currencyData = getCurrencyData(wantCurrency);
		if (!currencyData) {
			continue;
		}
		let paymentAmount = '';
		if (currencyData.rule00) {
			if (currencyData.allowDecimal) {
				// "45600" Only used by ISK (Island)
				paymentAmount = String(
					Math.floor((currencyConverted[currencyData.key] as number) * 100) * 100
				);
			} else {
				// "45600" Only used by UGX (Uganda)
				// The currency rate is high, so it is not divided by 100
				paymentAmount = String(
					Math.floor((currencyConverted[currencyData.key] as number) * 100) * 100
				);
			}
		} else {
			if (currencyData.allowDecimal) {
				// "45678"
				paymentAmount = String(Math.floor((currencyConverted[currencyData.key] as number) * 10000));
			} else {
				// "456"
				paymentAmount = String(Math.floor((currencyConverted[currencyData.key] as number) * 100));
			}
		}
		amountByCurrencies[currencyData.key] = paymentAmount;
	}

	return amountByCurrencies;
}
