import { env } from '$env/dynamic/private';
import type { SignResult } from '$lib-backend/functions/service/auth/action-init';
import { dbVerificationTokenCreate } from '$lib-backend/model/verification-token/create';
import { sendEmail } from '$lib-backend/utilities/email';
import { signUpTokenName } from '$lib-backend/utilities/verification-token';
import {
	redirectParam,
	getLanguageTagFromUrl,
	setLanguageTagToPath,
	signConfirmTokenParam
} from '$lib/utilities/url';

export async function prepareSignUp(
	requestUrl: URL,
	emailTo: string,
	signUpConfirmToken: string
): Promise<SignResult> {
	// 4. Save magic link token to DB
	const after1Day = new Date();
	after1Day.setDate(after1Day.getDate() + 1);
	const { dbError: dbVerifyError } = await dbVerificationTokenCreate({
		identifier: signUpTokenName,
		token: signUpConfirmToken,
		userId: null,
		expires: after1Day
	});
	if (dbVerifyError) {
		return { error: dbVerifyError };
	}

	const requestLang = getLanguageTagFromUrl(requestUrl);

	// 5. Send magic link by email
	const afterRedirectUrl = encodeURIComponent(requestUrl.searchParams.get(redirectParam) ?? '');
	const signUpConfirmUrl =
		requestUrl.origin +
		setLanguageTagToPath(
			`/signup/done?${signConfirmTokenParam}=${encodeURIComponent(signUpConfirmToken)}&${redirectParam}=${afterRedirectUrl}`,
			requestLang
		);
	const { sendEmailError } = await sendEmail(
		'ShortBook Service',
		env.EMAIL_FROM,
		[emailTo],
		'Sign up almost done | ShortBook',
		`<p>Thank you for signing up.</p>
		<p>Please click this button to confirm.</p>
		<p style="margin-bottom: 2rem;"><a href="${signUpConfirmUrl}" style="border-radius: 0.25em; background-color: #924240; color: #fff; display: inline-block; font-size: 2.5rem; font-weight: bold; padding: 0.5em;">Confirm Sign Up</a></p>
		<p>ShortBook LLC</p>
		<p>Shunsuke Kurachi (KurachiWeb)</p>`,
		`Thank you for signing up.\nPlease click this button to confirm.\n${signUpConfirmUrl}\n\nShortBook LLC\nShunsuke Kurachi (KurachiWeb)`
	);
	if (sendEmailError instanceof Error) {
		return { error: null, fail: "Can't sent email." };
	}

	return { error: null };
}
