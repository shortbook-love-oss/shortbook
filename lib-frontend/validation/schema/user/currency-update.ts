import { z } from 'zod';
import { validateOptionalCurrencyCode } from '$lib/validation/rules/currency';

export const schema = z.object({
	currencyCode: z.string().refine(validateOptionalCurrencyCode, {
		message: 'Please select one of supported currency'
	})
});
