import { redirect, fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { deleteSessionToken } from '$lib/utilities/cookie';
import { setLanguageTagToPath } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/user/delete';
import { dbUserDelete } from '$lib-backend/model/user/delete';

export const load = async ({ locals }) => {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}

	const form = await superValidate(zod(schema));

	form.data.keyHandle = signInUser.keyHandle;

	return { signInUser, form };
};

export const actions = {
	default: async ({ request, url, cookies, locals }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			if (form.data.keyHandle !== signInUser.keyHandle) {
				form.valid = false;
				form.errors.keyHandle = form.errors.keyHandle ?? [];
				form.errors.keyHandle.push('Input value does not match user handle.');
			}
		}
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const { dbError } = await dbUserDelete({ userId: signInUser.id });
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		deleteSessionToken(cookies);

		redirect(303, setLanguageTagToPath('/goodbye', url));
	}
};
