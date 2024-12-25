import { z } from 'zod';

export const schema = z.object({
	category: z.string().min(1).max(31),
	personName: z.string().min(1).max(100),
	email: z.string().email(),
	description: z.string().min(1).max(4e6), // less than 16,777,216 / 4 - 1
	files: z
		.instanceof(File, { message: 'Please select a file' })
		.array()
		.refine((files) => {
			let allFileSize = 0;
			for (const file of files) {
				allFileSize += file.size;
			}
			return allFileSize < 1024 ** 2 * 20;
		}, 'Cannot upload file over 20MB')
		.optional()
});
