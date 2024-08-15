import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dbBookCreate } from '$lib/model/book/create';
import { dbUserPaymentSettingGet } from '$lib/model/user/payment-setting/get';
import { dbUserProfileGet } from '$lib/model/user/profile/get';
import { getConvertedCurrencies } from '$lib/utilities/server/currency';
import { getBookCover } from '$lib/utilities/book';
import { defaultCurrency, type CurrencySupportKeys } from '$lib/utilities/currency';
import { type AvailableLanguageTags, languageAndNotSelect } from '$lib/utilities/language';
import { getLanguageTagFromUrl, setLanguageTagToPath } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/book-update';

export const load = async ({ url, locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}
	const requestLang = getLanguageTagFromUrl(url);

	const form = await superValidate(zod(schema));
	const langTags = languageAndNotSelect;

	const { profile, dbError: dbProfileGetError } = await dbUserProfileGet({ userId });
	if (!profile || dbProfileGetError) {
		return error(500, { message: dbProfileGetError?.message ?? '' });
	}
	const userKeyName = profile.key_name;
	const penName = profile.languages[0]?.pen_name ?? '';

	const { paymentSetting, dbError: dbPayGetError } = await dbUserPaymentSettingGet({ userId });
	if (dbPayGetError) {
		return error(500, { message: dbPayGetError.message });
	}
	const selectedCurrencyKey =
		(paymentSetting?.currency as CurrencySupportKeys) ?? defaultCurrency.key;

	// Show book price by all supported currencies
	const currencyRates = await getConvertedCurrencies(1, defaultCurrency.key);

	const bookCover = getBookCover({});
	for (const coverProp in bookCover) {
		const prop = coverProp as keyof typeof bookCover;
		form.data[prop] = bookCover[prop] as never;
	}
	form.data.nativeLanguage = (profile.native_language || requestLang) as AvailableLanguageTags;
	form.data.prologue = '';
	form.data.content = '';
	form.data.salesMessage = '';
	form.data.keyName = '';
	form.data.buyPoint = 200;

	return { form, userKeyName, penName, langTags, selectedCurrencyKey, currencyRates };
};

export const actions = {
	default: async ({ request, url, locals }) => {
		const userId = locals.session?.user?.id;
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { book, dbError } = await dbBookCreate({
			userId,
			status: 1,
			...form.data
		});
		if (!book || dbError) {
			return error(500, { message: dbError?.message ?? '' });
		}

		redirect(303, setLanguageTagToPath(`/book/${book.id}`, url));
	}
};
