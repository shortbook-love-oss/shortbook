import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dbUserPaymentSettingGet } from '$lib-backend/model/user/payment-setting/get';
import { dbUserPaymentSettingUpsert } from '$lib-backend/model/user/payment-setting/upsert';
import {
	currencySelect,
	guessCurrencyByLang,
	type CurrencySupportCodes
} from '$lib/utilities/currency';
import { getLanguageTagFromUrl } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/user/currency-update';

export const load = async ({ url, locals }) => {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}
	const requestLang = getLanguageTagFromUrl(url);

	const form = await superValidate(zod(schema));
	const currencyList = currencySelect;
	const suggestCurrency = guessCurrencyByLang(requestLang);

	const { paymentSetting, dbError } = await dbUserPaymentSettingGet({ userId: signInUser.id });
	if (!paymentSetting || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}

	form.data.currencyCode = paymentSetting.currency;

	return { form, currencyList, suggestCurrency };
};

export const actions = {
	default: async ({ request, locals }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { dbError } = await dbUserPaymentSettingUpsert({
			userId: signInUser.id,
			currencyCode: form.data.currencyCode as CurrencySupportCodes
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		return message(form, 'Currency changed');
	}
};
