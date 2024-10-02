import { z } from 'zod';
import { validateCurrencyCode } from '$lib/validation/rules/currency';

export const schema = z.object({
	currencyCode: z.string().refine(validateCurrencyCode, {
		message: 'Please select one of supported currency'
	})
});
