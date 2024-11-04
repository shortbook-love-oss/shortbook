import { z } from 'zod';
import { schema as createSchema } from '$lib/validation/schema/book/draft-create';
import { schemaPartUrlSlug } from '$lib/validation/schema/book/update';

export const schema = z
	.object({
		bookId: z.string().cuid()
	})
	.merge(schemaPartUrlSlug)
	.merge(createSchema);
