import { z } from 'zod';

export const schema = z
	.object({
		keyName: z.string(),
		deleteKey: z.string().min(1)
	})
	.refine((data) => data.keyName === data.deleteKey, {
		message: 'Input value does not match user ID.',
		path: ['deleteKey']
	});
