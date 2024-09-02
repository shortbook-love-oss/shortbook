import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { env } from '$env/dynamic/private';
import { dbLogActionCreate } from '$lib-backend/model/log/action-create';
import { dbLogActionList } from '$lib-backend/model/log/action-list';
import { dbUserProfileGet } from '$lib-backend/model/user/profile/get';
import { dbUserGetByEmailHash } from '$lib-backend/model/user/get-by-email-hash';
import { dbVerificationTokenCreate } from '$lib-backend/model/verification-token/create';
import { matchSigninProvider, signInEmailLinkMethod } from '$lib/utilities/signin';
import {
	emailChangeTokenParam,
	getLanguageTagFromUrl,
	setLanguageTagToPath
} from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/user/email-update';
import { decryptFromFlat, encryptAndFlat, toHash } from '$lib-backend/utilities/crypto';
import { sendEmail, toHashUserEmail } from '$lib-backend/utilities/email';
import { changeEmailLogActionName, changeEmailRateLimit } from '$lib-backend/utilities/log-action';
import { emailChangeTokenName } from '$lib-backend/utilities/verification-token';

export const load = async ({ locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	const form = await superValidate(zod(schema));

	const { account, profile, dbError } = await dbUserProfileGet({ userId });
	if (dbError) {
		return error(500, { message: dbError.message });
	}
	const signInProvider = matchSigninProvider(account?.provider ?? '');
	const penName = profile?.languages[0]?.pen_name ?? '';

	const currentEmail = decryptFromFlat(
		locals.session?.user?.email ?? '',
		env.ENCRYPT_EMAIL_USER,
		env.ENCRYPT_SALT
	);

	form.data.email = '';

	return { form, penName, currentEmail, signInProvider };
};

export const actions = {
	default: async ({ request, url, locals, getClientAddress }) => {
		const userId = locals.session?.user?.id;
		if (!userId) {
			return error(401, { message: 'Unauthorized' });
		}
		const requestLang = getLanguageTagFromUrl(url);
		const ipAddressHash = toHash(getClientAddress(), env.HASH_IP_ADDRESS);

		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			// Block if rate limit exceeded
			const before1Hour = new Date();
			before1Hour.setHours(before1Hour.getHours() - 1);
			const { logActions, dbError: dbLogError } = await dbLogActionList({
				actionName: changeEmailLogActionName,
				ipAddressHash,
				dateFrom: before1Hour
			});
			if (dbLogError) {
				return error(500, { message: dbLogError.message });
			}
			if (logActions && logActions.length >= changeEmailRateLimit) {
				form.valid = false;
				form.errors.email = form.errors.email ?? [];
				form.errors.email.push('Too many submissions. Please try again in an hour.');
			}
		}
		if (form.valid) {
			// If already use email by another user, show error message near the input
			const emailHash = toHashUserEmail(form.data.email, signInEmailLinkMethod);
			const { user, dbError } = await dbUserGetByEmailHash({ emailHash });
			if (dbError) {
				return error(500, { message: dbError.message });
			}
			if (user) {
				form.valid = false;
				form.errors.email = form.errors.email ?? [];
				if (user.id === userId) {
					form.errors.email.push('You are using this email address');
				} else {
					form.errors.email.push('This email is in use by another user');
				}
			}
		}
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		// Generate token include email
		const emailChangeToken = encryptAndFlat(
			form.data.email,
			env.ENCRYPT_EMAIL_USER,
			env.ENCRYPT_SALT
		);
		const signUpConfirmUrl =
			url.origin +
			setLanguageTagToPath(
				`/mypage/security/email/confirm?${emailChangeTokenParam}=${encodeURIComponent(emailChangeToken)}`,
				requestLang
			);

		// Save magic link token to DB
		const after1Hour = new Date();
		after1Hour.setHours(after1Hour.getHours() + 1);
		const { dbError: dbVerifyError } = await dbVerificationTokenCreate({
			identifier: emailChangeTokenName,
			token: emailChangeToken,
			userId,
			expires: after1Hour
		});
		if (dbVerifyError) {
			return error(500, { message: dbVerifyError.message });
		}

		// Send email with magic link
		const { sendEmailError } = await sendEmail(
			'ShortBook Service',
			env.EMAIL_FROM,
			[form.data.email],
			'Confirm your email address change.',
			`<p>Please click this button to confirm.</p>
			<p style="margin-bottom: 2rem;"><a href="${signUpConfirmUrl}" style="border-radius: 0.25em; background-color: #924240; color: #fff; display: inline-block; font-size: 1.5rem; font-weight: bold; padding: 0.5em;">Complete change</a></p>
			<p>ShortBook LLC</p>
			<p>Shunsuke Kurachi (KurachiWeb)</p>`,
			`Please click this button to confirm.\n${signUpConfirmUrl}\n\nShortBook LLC\nShunsuke Kurachi (KurachiWeb)`
		);
		if (sendEmailError) {
			return error(500, { message: "Can't sent email." });
		}

		// Save log for rate limit
		const { dbError: dbLogCreateError } = await dbLogActionCreate({
			actionName: changeEmailLogActionName,
			ipAddressHash
		});
		if (dbLogCreateError) {
			return error(500, { message: dbLogCreateError.message });
		}

		return message(form, 'Sent confirm email successfully.');
	}
};
