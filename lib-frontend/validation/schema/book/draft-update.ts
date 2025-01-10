import { z } from 'zod';
import { schema as createSchema } from '$lib/validation/schema/book/draft-create';

export const schema = z
	.object({
		bookId: z.string().ulid()
	})
	.merge(createSchema);
