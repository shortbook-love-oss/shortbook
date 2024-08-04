import { error, redirect } from '@sveltejs/kit';
import { fail, message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { schema } from '$lib/validation/schema/signin-by-email';
import { getRandom } from '$lib/utilities/crypto';
import { callbackParam, getSafetyUrl } from '$lib/utilities/url';
import { beforeSign, type SignResult } from '../actionInit';
import { prepareSignIn } from '../prepareSignIn';
import { prepareSignUp } from '../prepareSignUp';

export async function load({ locals, url }) {
	const session = await locals.auth();

	const maybeCallbackUrl = url.searchParams.get(callbackParam) ?? '';
	const callbackUrl = getSafetyUrl(maybeCallbackUrl, url.origin);
	if (session?.user) {
		// This page will not be displayed even if a signed-in user goes back in history
		redirect(303, getSafetyUrl(callbackUrl.href, url.origin));
	}
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
		const signConfirmToken = getRandom(32);

		const initResult = await beforeSign(form, getClientAddress());
		if (initResult.error instanceof Error) {
			return error(500, { message: initResult.error.message ?? '' });
		} else if (initResult.fail) {
			message(form, initResult.fail);
			return fail(400, { form });
		}

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
