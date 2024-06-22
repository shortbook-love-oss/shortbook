import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { availableLanguageTags } from '$lib/i18n/paraglide/runtime.js';
import { dbUserProfileGet } from '$lib/model/user/profile/get';
import { dbUserProfileUpdate } from '$lib/model/user/profile/update';
import { dbUserGetBySlug } from '$lib/model/user/get-by-slug';
import { getUserId } from '$lib/utilities/cookie';
import { guessNativeLangFromRequest } from '$lib/utilities/language';
import { schema } from '$lib/validation/schema/profile-update';

export const load = async ({ request, cookies }) => {
	const form = await superValidate(zod(schema));
	// e.g. "/ja/mypage" → ja
	const nativeLang = guessNativeLangFromRequest(request);

	const userId = getUserId(cookies);
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	const { profile, dbError } = await dbUserProfileGet({ userId });
	if (dbError) {
		return error(500, {
			message: 'Server error: Failed to get user.'
		});
	}
	const profileLangs = profile?.langs[0];

	form.data.slug = profile?.slug ?? '';
	form.data.nativeLang = nativeLang;
	form.data.penName = profileLangs?.pen_name ?? '';
	form.data.headline = profileLangs?.headline ?? '';
	form.data.selfIntro = profileLangs?.self_intro ?? '';

	const list = {
		langTags: [
			{ value: '', text: 'Select your language' },
			...availableLanguageTags.map((tag) => ({ value: tag, text: tag }))
		]
	};

	return { form, list };
};

export const actions = {
	default: async ({ request, cookies }) => {
		const userId = getUserId(cookies);
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			// If already use slug, show error message near the slug input
			const { user, dbError } = await dbUserGetBySlug({ slug: form.data.slug });
			if (dbError) {
				return error(500, {
					message: 'Server error: Failed to get user.'
				});
			}
			if (user && user.id !== userId) {
				form.valid = false;
				form.errors.slug = form.errors.slug ?? [];
				form.errors.slug.push('This slug is in use by another user');
			}
		}
		if (!form.valid) {
			return fail(400, { form });
		}

		const { dbError } = await dbUserProfileUpdate({
			userId,
			...form.data
		});
		if (dbError) {
			return error(500, {
				message: 'Server error: Failed to update user.'
			});
		}

		return message(form, 'Profile updated successfully.');
	}
};
