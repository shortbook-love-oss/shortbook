import { z } from 'zod';

export const schema = z
	.object({
		slug: z.string(),
		deleteKey: z.string().min(1)
	})
	.refine((data) => data.slug === data.deleteKey, {
		message: 'Input value does not match user slug.',
		path: ['deleteKey']
	});
