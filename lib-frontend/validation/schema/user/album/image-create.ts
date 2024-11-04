import { z } from 'zod';
import { imageMIMEextension } from '$lib/utilities/file';
import { isValidFilesSize } from '$lib/validation/rules/file';

export const schema = z.object({
	images: z
		.instanceof(File, { message: 'Please select images' })
		.refine((f) => Object.keys(imageMIMEextension).includes(f.type), {
			message: 'Only files you can upload are images'
		})
		.array()
		.min(1, { message: 'Please select images' })
		.max(200, { message: 'Too many images (up to 200)' })
		.refine((files) => isValidFilesSize(files), 'Cannot upload files over 28 MB')
});
