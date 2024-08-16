import { dbUserPaymentSettingGet } from '$lib/model/user/payment-setting/get';
import { dbUserProfileGet } from '$lib/model/user/profile/get';
import { getConvertedCurrencies } from '$lib/utilities/server/currency';
import { defaultCurrency, type CurrencySupportKeys } from '$lib/utilities/currency';
import { error } from '@sveltejs/kit';

export async function editLoad(userId: string) {
	const { profile, dbError: dbProfileGetError } = await dbUserProfileGet({ userId });
	if (!profile || dbProfileGetError) {
		error(500, { message: dbProfileGetError?.message ?? '' });
	}
	const userKeyName = profile.key_name;
	const penName = profile.languages[0]?.pen_name ?? '';

	const { paymentSetting, dbError: dbPayGetError } = await dbUserPaymentSettingGet({ userId });
	if (dbPayGetError) {
		error(500, { message: dbPayGetError.message });
	}
	const selectedCurrencyKey =
		(paymentSetting?.currency as CurrencySupportKeys) ?? defaultCurrency.key;

	// Show book price by all supported currencies
	const currencyRates = await getConvertedCurrencies(1, defaultCurrency.key);

	return { profile, userKeyName, penName, selectedCurrencyKey, currencyRates };
}
