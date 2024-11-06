import { z } from 'zod';
import { validateEditorContent } from '$lib/validation/rules/book';

export const schema = z.object({
	title: z.string().max(200),
	subtitle: z.string().max(200),
	prologue: z.record(z.record(z.unknown())).refine(validateEditorContent, {
		message: 'Invalid serialized book content'
	}),
	content: z.record(z.record(z.unknown())).refine(validateEditorContent, {
		message: 'Invalid serialized book content'
	})
});
