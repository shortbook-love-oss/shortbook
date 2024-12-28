import { env } from '$env/dynamic/private';
import * as m from '$i18n/output/messages';
import { escapeHTML } from '$lib/utilities/html';
import {
	redirectParam,
	getLanguageTagFromUrl,
	setLanguageTagToPath,
	signConfirmTokenParam
} from '$lib/utilities/url';
import type { SignResult } from '$lib-backend/functions/service/auth/action-init';
import type { dbUserGetByEmailHash } from '$lib-backend/model/user/get-by-email-hash';
import { dbVerificationTokenCreate } from '$lib-backend/model/verification-token/create';
import { sendEmail } from '$lib-backend/utilities/email';
import { signInTokenName } from '$lib-backend/utilities/verification-token';

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
	const mailContentIntroductions = m
		.signin_mail_introduction({ name: escapeHTML(user.pen_name) }, { languageTag: requestLang })
		.split('\n');
	const mailContentThank = m.message_thank({ languageTag: requestLang });
	const { sendEmailError } = await sendEmail(
		m.mail_sender_account({ languageTag: requestLang }),
		env.EMAIL_FROM,
		[emailTo],
		m.signin_mail_title({ languageTag: requestLang }),
		`<div style="margin-bottom: 2rem;">${mailContentIntroductions.map((line) => `<p>${line}</p>`).join('')}</div>
		<p style="margin-bottom: 2rem;"><a href="${signInConfirmUrl}" style="border-radius: 0.25em; background-color: #924240; color: #fff; display: inline-block; font-size: 2.5rem; font-weight: bold; padding: 0.5em; text-underline-offset: 0.15em;">${m.signin_title({ languageTag: requestLang })}</a></p>
		${mailContentThank ? `<p style="margin-bottom: 2rem;">${mailContentThank}</p>` : ''}
		<p>ShortBook LLC</p>
		<p>KurachiWeb (Shunsuke Kurachi)</p>`,
		`${mailContentIntroductions.join('\n')}\n\n${signInConfirmUrl}\n\n$${mailContentThank ? `${mailContentThank}\n\n` : ''}ShortBook LLC\nKurachiWeb (Shunsuke Kurachi)`
	);
	if (sendEmailError instanceof Error) {
		return { error: null, fail: "Can't sent email." };
	}

	return { error: null };
}
