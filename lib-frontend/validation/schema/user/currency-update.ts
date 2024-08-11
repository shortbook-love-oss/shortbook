import { z } from 'zod';
import { currencySupports } from '$lib/utilities/currency';

export const schema = z.object({
	currencyKey: z.string().refine(
		(value) => {
			if (value === '') {
				return true;
			}
			return currencySupports.find((c) => c.key === value);
		},
		{
			message: 'Please select one of supported currency'
		}
	)
});
