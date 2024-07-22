import { z } from 'zod';
import { imageMIMEextension } from '$lib/utilities/file';

export const schema = z.object({
	profileImage: z
		.instanceof(File, { message: 'Please select a file' })
		.refine((f) => Object.keys(imageMIMEextension).includes(f.type), {
			message: 'Only files you can upload are images'
		})
		.refine((f) => f.size < 1024 ** 2 * 2, 'Cannot upload file over 2MB')
		.array()
		.length(1, { message: 'Please select a file' })
});
