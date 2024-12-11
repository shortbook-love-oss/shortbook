import { fail, error, redirect } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import { getLanguageTagFromUrl, setLanguageTagToPath } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/user/album/image-update';
import { dbUserAlbumImageUpdate } from '$lib-backend/model/user/album/image-update';

export const actions = {
	default: async ({ request, url, params, locals }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}

		const requestLang = getLanguageTagFromUrl(url);

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { dbError } = await dbUserAlbumImageUpdate({
			userId: signInUser.id,
			imageId: params.imageId,
			name: form.data.name,
			alt: form.data.alt,
			inImageLanguage: form.data.inImageLanguage as AvailableLanguageTags | '',
			place: form.data.place,
			copyrightOwner: form.data.copyrightOwner,
			targetInImage: form.data.targetInImage,
			licenseUrl: form.data.licenseUrl,
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
