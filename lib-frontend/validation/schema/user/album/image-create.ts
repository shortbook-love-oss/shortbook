import { z } from 'zod';
import { imageMIMEextension } from '$lib/utilities/file';

export const schema = z.object({
	images: z
		.instanceof(File, { message: 'Please select images' })
		.refine((f) => Object.keys(imageMIMEextension).includes(f.type), {
			message: 'Only files you can upload are images'
		})
		.array()
		.min(1, { message: 'Please select images' })
		.max(200, { message: 'Too many images (up to 200)' })
		.refine((files) => {
			const sizeSum = files.map((f) => f.size).reduce((x, y) => x + y, 0);
			return sizeSum < 1024 ** 2 * 28;
		}, 'Cannot upload file over 28 MB')
});
