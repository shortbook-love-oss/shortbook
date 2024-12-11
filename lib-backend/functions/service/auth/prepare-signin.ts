import { env } from '$env/dynamic/private';
import type { SignResult } from '$lib-backend/functions/service/auth/action-init';
import type { dbUserGetByEmailHash } from '$lib-backend/model/user/get-by-email-hash';
import { dbVerificationTokenCreate } from '$lib-backend/model/verification-token/create';
import { sendEmail } from '$lib-backend/utilities/email';
import { signInTokenName } from '$lib-backend/utilities/verification-token';
import { escapeHTML } from '$lib/utilities/html';
import {
	redirectParam,
	getLanguageTagFromUrl,
	setLanguageTagToPath,
	signConfirmTokenParam
} from '$lib/utilities/url';

export async function prepareSignIn(
	requestUrl: URL,
	user: NonNullable<Awaited<ReturnType<typeof dbUserGetByEmailHash>>['user']>,
	emailTo: string,
	signInConfirmToken: string
): Promise<SignResult> {
	// 4. Save magic link token to DB
	const after1Day = new Date();
	after1Day.setDate(after1Day.getDate() + 1);
	const { dbError: dbVerifyError } = await dbVerificationTokenCreate({
		identifier: signInTokenName,
		token: signInConfirmToken,
		userId: null,
		expires: after1Day
	});
	if (dbVerifyError) {
		return { error: dbVerifyError };
	}

	const requestLang = getLanguageTagFromUrl(requestUrl);

	// 5. Send magic link by email
	const afterRedirectUrl = encodeURIComponent(requestUrl.searchParams.get(redirectParam) ?? '');
	const signInConfirmUrl =
		requestUrl.origin +
		setLanguageTagToPath(
			`/signin/done?${signConfirmTokenParam}=${encodeURIComponent(signInConfirmToken)}&${redirectParam}=${afterRedirectUrl}`,
			requestLang
		);
	const { sendEmailError } = await sendEmail(
		'ShortBook Service',
		env.EMAIL_FROM,
		[emailTo],
		'Sign in confirm | ShortBook',
		`<p>${escapeHTML(user.pen_name)}, thank you for your continued activity.</p>
		<p>Please click this button to confirm.</p>
		<p style="margin-bottom: 2rem;"><a href="${signInConfirmUrl}" style="border-radius: 0.25em; background-color: #924240; color: #fff; display: inline-block; font-size: 2.5rem; font-weight: bold; padding: 0.5em;">Confirm Sign In</a></p>
		<p>ShortBook LLC</p>
		<p>Shunsuke Kurachi (KurachiWeb)</p>`,
		`${user.pen_name}, thank you for your continued activity.\nPlease click this button to confirm.\n${signInConfirmUrl}\n\nShortBook LLC\nShunsuke Kurachi (KurachiWeb)`
	);
	if (sendEmailError instanceof Error) {
		return { error: null, fail: "Can't sent email." };
	}

	return { error: null };
}
