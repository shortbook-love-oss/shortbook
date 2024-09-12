import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { getLanguageTagFromUrl, setLanguageTagToPath } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/user/album/image-update';
import { dbUserAlbumImageUpdate } from '$lib-backend/model/user/album/image-update';

export const actions = {
	default: async ({ request, url, params, locals }) => {
		const userId = locals.session?.user?.id;
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const requestLang = getLanguageTagFromUrl(url);

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { dbError } = await dbUserAlbumImageUpdate({
			userId: userId,
			imageId: params.imageId,
			name: form.data.name,
			alt: form.data.alt,
			languageInImage: '',
			place: form.data.place,
			licenseUrl: form.data.licenseUrl,
			creditNotice: form.data.creditNotice,
			isSensitive: form.data.isSensitive,
			isAi: form.data.isAi
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		const afterUrl = new URL(url.origin + setLanguageTagToPath(`/mypage/asset/album`, requestLang));
		redirect(303, afterUrl.href);
	}
};
