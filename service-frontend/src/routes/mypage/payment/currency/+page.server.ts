import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dbUserPaymentSettingGet } from '$lib-backend/model/user/payment-setting/get';
import { dbUserPaymentSettingUpsert } from '$lib-backend/model/user/payment-setting/upsert';
import {
	currencyAndNoSelect,
	guessCurrencyByLang,
	type CurrencySupportKeys
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

	const { paymentSetting, dbError } = await dbUserPaymentSettingGet({ userId: signInUser.id });
	if (dbError) {
		return error(500, { message: dbError.message });
	}
	if (paymentSetting) {
		form.data.currencyKey = paymentSetting.currency;
	} else {
		form.data.currencyKey = '';
	}

	const currencyList = currencyAndNoSelect;
	const suggestCurrency = guessCurrencyByLang(requestLang);

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
			currencyKey: form.data.currencyKey as CurrencySupportKeys
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		return message(form, 'Currency changed');
	}
};
