import { error, redirect } from '@sveltejs/kit';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { env } from '$env/dynamic/private';
import { callbackParam, getSafetyUrl } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/user/signin-by-email';
import { beforeSign, type SignResult } from '$lib-backend/functions/service/auth/action-init';
import { prepareSignIn } from '$lib-backend/functions/service/auth/prepare-signin';
import { prepareSignUp } from '$lib-backend/functions/service/auth/prepare-signup';
import { encryptAndFlat } from '$lib-backend/utilities/crypto';

export async function load({ locals, url }) {
	const maybeCallbackUrl = url.searchParams.get(callbackParam) ?? '';
	const callbackUrl = getSafetyUrl(maybeCallbackUrl, url.origin);
	if (locals.signInUser) {
		// This page will not be displayed even if a signed-in user goes back in history
		redirect(303, getSafetyUrl(callbackUrl.href, url.origin));
	}
	// Prevent callback to different origin
	if (!URL.canParse(maybeCallbackUrl) || new URL(maybeCallbackUrl).origin !== url.origin) {
		const redirectTo = new URL(url);
		redirectTo.searchParams.set(callbackParam, url.origin);
		redirect(303, redirectTo.href);
	}

	const form = await superValidate(zod(schema));
	form.data.email = '';

	return { form, callbackUrl: callbackUrl.href };
}

export const actions = {
	default: async ({ request, url, getClientAddress }) => {
		const form = await superValidate(request, zod(schema));

		const initResult = await beforeSign(form, getClientAddress());
		if (initResult.error instanceof Error) {
			return error(500, { message: initResult.error.message ?? '' });
		} else if (initResult.fail) {
			message(form, initResult.fail);
			return fail(400, { form });
		}

		// Generate token include email
		const signConfirmToken = encryptAndFlat(
			form.data.email,
			env.ENCRYPT_EMAIL_USER,
			env.ENCRYPT_SALT
		);

		let prepareResult: SignResult;
		if (initResult.user) {
			prepareResult = await prepareSignIn(url, initResult.user, form.data.email, signConfirmToken);
		} else {
			prepareResult = await prepareSignUp(url, form.data.email, signConfirmToken);
		}
		if (prepareResult.error instanceof Error) {
			return error(500, { message: prepareResult.error.message ?? '' });
		} else if (prepareResult.fail) {
			message(form, prepareResult.fail);
			return fail(400, { form });
		}

		return message(form, 'Sent confirm link to your email.');
	}
};
