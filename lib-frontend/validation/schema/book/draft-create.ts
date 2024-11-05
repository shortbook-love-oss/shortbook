import { z } from 'zod';
import { validAsJson, validateOnlyVisibleChar } from '$lib/validation/rules/string';

export const schema = z.object({
	title: z.string().max(200).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	subtitle: z.string().max(200).refine(validateOnlyVisibleChar, {
		message: 'Cannot register using only invisible characters'
	}),
	prologue: z.string().min(1).max(5e8).refine(validAsJson, {
		message: 'Invalid JSON'
	}),
	content: z.string().min(1).max(5e8).refine(validAsJson, {
		message: 'Invalid JSON'
	})
});
