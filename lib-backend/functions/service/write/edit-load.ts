import { error } from '@sveltejs/kit';
import { defaultCurrency, type CurrencySupportValues } from '$lib/utilities/currency';
import type { SignInUser } from '$lib/utilities/signin';
import { dbCurrencyRateGet } from '$lib-backend/model/currency/get';
import { dbUserPaymentSettingGet } from '$lib-backend/model/user/payment-setting/get';

export async function editLoad(signInUser: SignInUser) {
	const { paymentSetting, dbError: dbPayGetError } = await dbUserPaymentSettingGet({
		userId: signInUser.id
	});
	if (dbPayGetError) {
		error(500, { message: dbPayGetError.message });
	}
	const selectedCurrencyKey =
		(paymentSetting?.currency as CurrencySupportValues) ?? defaultCurrency.value;

	// Show book price by all supported currencies
	const { currencyRateIndex, dbError: dbRateGetError } = await dbCurrencyRateGet({ amount: 0.01 });
	if (dbRateGetError) {
		error(500, { message: dbRateGetError.message });
	}

	return { selectedCurrencyKey, currencyRateIndex };
}
