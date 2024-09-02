import { error } from '@sveltejs/kit';
import { dbUserPaymentSettingGet } from '$lib-backend/model/user/payment-setting/get';
import { dbUserProfileGet } from '$lib-backend/model/user/profile/get';
import { defaultCurrency, type CurrencySupportKeys } from '$lib/utilities/currency';
import { dbCurrencyRateGet } from '$lib-backend/model/currency/get';

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
	const { currencyRateIndex, dbError: dbRateGetError } = await dbCurrencyRateGet({ amount: 0.01 });
	if (dbRateGetError) {
		error(500, { message: dbRateGetError.message });
	}

	return { profile, userKeyName, penName, selectedCurrencyKey, currencyRateIndex };
}
