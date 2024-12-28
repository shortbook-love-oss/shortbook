import { env } from '$env/dynamic/private';
import * as m from '$i18n/output/messages';
import {
	redirectParam,
	getLanguageTagFromUrl,
	setLanguageTagToPath,
	signConfirmTokenParam
} from '$lib/utilities/url';
import type { SignResult } from '$lib-backend/functions/service/auth/action-init';
import { dbVerificationTokenCreate } from '$lib-backend/model/verification-token/create';
import { sendEmail } from '$lib-backend/utilities/email';
import { signUpTokenName } from '$lib-backend/utilities/verification-token';

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
	const mailContentIntroductions = m
		.signup_mail_introduction({ languageTag: requestLang })
		.split('\n');
	const mailContentThank = m.message_thank({ languageTag: requestLang });
	const { sendEmailError } = await sendEmail(
		m.mail_sender_account({ languageTag: requestLang }),
		env.EMAIL_FROM,
		[emailTo],
		m.signup_mail_title({ languageTag: requestLang }),
		`<div style="margin-bottom: 2rem;">${mailContentIntroductions.map((line) => `<p>${line}</p>`).join('')}</div>
		<p style="margin-bottom: 2rem;"><a href="${signUpConfirmUrl}" style="border-radius: 0.25em; background-color: #924240; color: #fff; display: inline-block; font-size: 2.5rem; font-weight: bold; padding: 0.5em; text-underline-offset: 0.15em;">${m.signup_title({ languageTag: requestLang })}</a></p>
		${mailContentThank ? `<p style="margin-bottom: 2rem;">${mailContentThank}</p>` : ''}
		<p>ShortBook LLC</p>
		<p>Shunsuke Kurachi (KurachiWeb)</p>`,
		`${mailContentIntroductions.join('\n')}\n\n${signUpConfirmUrl}\n\n${mailContentThank ? `${mailContentThank}\n\n` : ''}ShortBook LLC\nShunsuke Kurachi (KurachiWeb)`
	);
	if (sendEmailError instanceof Error) {
		return { error: null, fail: "Can't sent email." };
	}

	return { error: null };
}
