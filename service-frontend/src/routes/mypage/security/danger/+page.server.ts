import { redirect, fail, error as kitError } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { dbUserDelete } from '$lib/model/user/delete';
import { dbUserProfileGet } from '$lib/model/user/profile/get';
import { getUserId } from '$lib/utilities/cookie';
import { getLangTagPathPart } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/user-delete';

export const load = async ({ cookies }) => {
	const form = await superValidate(zod(schema));

	const { profile, error } = await dbUserProfileGet({
		userId: getUserId(cookies)
	});
	if (error) {
		return kitError(500, {
			message: 'Server error: Failed to get user.'
		});
	}
	const penName = profile?.langs[0]?.pen_name ?? '';

	form.data.slug = profile?.slug ?? '';

	return { form, penName };
};

export const actions = {
	default: async ({ request, url, cookies }) => {
		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			return fail(400, { form });
		}
		const userId = getUserId(cookies);
		if (!userId) {
			return kitError(401, { message: 'Unauthorized' });
		}

		const { error } = await dbUserDelete({ userId });
		if (error) {
			return kitError(500, {
				message: 'Server error: Failed to delete user.'
			});
		}

		redirect(303, `${getLangTagPathPart(url.pathname)}/goodbye`);
	}
};
