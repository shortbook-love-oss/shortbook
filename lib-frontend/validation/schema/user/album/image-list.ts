import { z } from 'zod';

export const schema = z.object({
	limit: z.coerce.number().min(1).max(20),
	page: z.coerce.number().min(0)
});
