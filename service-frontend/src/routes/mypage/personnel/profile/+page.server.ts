import { fail } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { availableLanguageTags } from '$lib/i18n/paraglide/runtime.js';
import prisma from '$lib/prisma/connect';
import { getUserId, keyUserId } from '$lib/utilities/cookie.js';
import { guessNativeLangFromRequest } from '$lib/utilities/language';
import { schema } from '$lib/validation/scheme/profile-update';

export const load = async ({ request, cookies }) => {
	const form = await superValidate(zod(schema));

	// e.g. "/ja/mypage" → ja
	const nativeLang = guessNativeLangFromRequest(request);

	const userProfile = await prisma.user_profiles.findFirst({
		where: {
			user_id: cookies.get(keyUserId)
		},
		include: {
			langs: true
		}
	});
	const userProfileLangs = userProfile?.langs[0];

	form.data.slug = userProfile?.slug ?? '';
	form.data.nativeLang = nativeLang;
	form.data.penName = userProfileLangs?.pen_name ?? '';
	form.data.headline = userProfileLangs?.headline ?? '';
	form.data.selfIntro = userProfileLangs?.self_intro ?? '';

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
		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			return fail(400, { form });
		}
		const userId = getUserId(cookies);
		if (!userId) {
			return fail(401, { message: 'Unauthorized' });
		}

		await prisma.$transaction(async (tx) => {
			const profile = await tx.user_profiles.update({
				where: { user_id: userId },
				data: {
					slug: form.data.slug,
					native_lang: form.data.nativeLang
				},
				include: {
					langs: true
				}
			});
			await tx.user_profile_langs.deleteMany({
				where: { profile_id: profile.id }
			});
			await tx.user_profile_langs.createMany({
				data: [
					{
						profile_id: profile.id,
						lang_tag: form.data.nativeLang,
						pen_name: form.data.penName,
						headline: form.data.headline,
						self_intro: form.data.selfIntro
					}
				]
			});
		});

		return message(form, 'Profile updated successfully.');
	}
};
