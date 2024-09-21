import { z } from 'zod';

export const schema = z.object({
	keyHandle: z.string().min(1)
});
