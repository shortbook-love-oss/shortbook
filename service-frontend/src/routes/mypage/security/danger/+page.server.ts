import { redirect, fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { deleteSessionToken } from '$lib/utilities/cookie';
import { setLanguageTagToPath } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/user/delete';
import { dbUserProfileGet } from '$lib-backend/model/user/profile/get';
import { dbUserDelete } from '$lib-backend/model/user/delete';

export const load = async ({ locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	const form = await superValidate(zod(schema));

	const { profile, dbError } = await dbUserProfileGet({ userId });
	if (dbError) {
		return error(500, { message: dbError.message });
	}
	const penName = profile?.languages[0]?.pen_name ?? '';

	form.data.keyName = profile?.key_name ?? '';

	return { form, penName };
};

export const actions = {
	default: async ({ request, url, cookies, locals }) => {
		const userId = locals.session?.user?.id;
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { dbError } = await dbUserDelete({ userId });
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		deleteSessionToken(cookies);

		redirect(303, setLanguageTagToPath('/goodbye', url));
	}
};
