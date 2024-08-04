import { env } from '$env/dynamic/private';
import { sourceLanguageTag } from '$lib/i18n/paraglide/runtime';
import type { dbUserGetByEmailHash } from '$lib/model/user/get-by-email-hash';
import { dbVerificationTokenCreate } from '$lib/model/verification-token/create';
import { sendEmail } from '$lib/utilities/server/email';
import { signInTokenName } from '$lib/utilities/signin';
import { callbackParam, getLangTag, getLangTagPathPart } from '$lib/utilities/url';
import type { SignResult } from './actionInit';

export async function prepareSignIn(
	requestUrl: URL,
	user: Awaited<ReturnType<typeof dbUserGetByEmailHash>>['user'],
	emailTo: string,
	signInConfirmToken: string
): Promise<SignResult> {
	// 4. Save magic link token to DB
	const after1Day = new Date();
	after1Day.setDate(after1Day.getDate() + 1);
	const { dbError: dbVerifyError } = await dbVerificationTokenCreate({
		identifier: signInTokenName,
		token: signInConfirmToken,
		expires: after1Day
	});
	if (dbVerifyError) {
		return { error: dbVerifyError };
	}

	const requestLang = getLangTag(requestUrl.pathname) || sourceLanguageTag;
	const profile = user?.profiles;
	let profileLang = profile?.languages.find((lang) => lang.language_code === requestLang);
	if (!profileLang && profile?.languages.length) {
		profileLang = profile.languages[0];
	}

	// 5. Send magic link by email
	const afterCallbackUrl = encodeURIComponent(requestUrl.searchParams.get(callbackParam) ?? '');
	const signInConfirmUrl = `${requestUrl.origin}${getLangTagPathPart(requestUrl.pathname)}/signin/confirm?token=${signInConfirmToken}&${callbackParam}=${afterCallbackUrl}`;
	const { sendEmailError } = await sendEmail(
		env.EMAIL_FROM,
		[emailTo],
		'Sign in confirm | ShortBook',
		`<p>${profileLang?.pen_name}, thank you for your continued activity.</p>
		<p>Please click this button to confirm.</p>
		<p style="margin-bottom: 2rem;"><a href="${signInConfirmUrl}" style="border-radius: 0.25em; background-color: #924240; color: #fff; display: inline-block; font-size: 1.5rem; font-weight: bold; padding: 0.5em;">Got it!</a></p>
		<p>ShortBook LLC</p>
		<p>Shunsuke Kurachi (KurachiWeb)</p>`,
		`Thank you for your continued activity.\nPlease click this button to confirm.\n${signInConfirmUrl}\n\nShortBook LLC\nShunsuke Kurachi (KurachiWeb)`
	);
	if (sendEmailError instanceof Error) {
		return { error: null, fail: "Can't sent email." };
	}

	return { error: null };
}
