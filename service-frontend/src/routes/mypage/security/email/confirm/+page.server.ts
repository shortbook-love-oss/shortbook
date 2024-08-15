import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dbUserGetByEmailHash } from '$lib/model/user/get-by-email-hash';
import { dbUserProvideDataUpdate } from '$lib/model/user/update-provide-data';
import { dbVerificationTokenDelete } from '$lib/model/verification-token/delete';
import { dbVerificationTokenGet } from '$lib/model/verification-token/get';
import { decryptFromFlat, encryptAndFlat } from '$lib/utilities/server/crypto';
import { toHashUserEmail } from '$lib/utilities/server/email';
import { emailChangeTokenName } from '$lib/utilities/server/verification-token';
import { signInEmailLinkMethod } from '$lib/utilities/signin';
import { emailChangeTokenParam, setLanguageTagToPath } from '$lib/utilities/url';

export const load = async ({ url, locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	// Check token in url
	const token = url.searchParams.get(emailChangeTokenParam);
	const { verificationToken, dbError: dbVerifyGetError } = await dbVerificationTokenGet({
		identifier: emailChangeTokenName,
		token: token ?? '',
		userId
	});
	if (!verificationToken || dbVerifyGetError) {
		return error(404, { message: 'Not found' });
	}
	const userEmail = decryptFromFlat(
		verificationToken.token,
		env.ENCRYPT_EMAIL_USER,
		env.ENCRYPT_SALT
	);
	if (!userEmail) {
		return error(401, { message: 'Unauthorized' });
	}

	// If already use email by another user, cancel process
	const emailEncrypt = encryptAndFlat(userEmail, env.ENCRYPT_EMAIL_USER, env.ENCRYPT_SALT);
	const emailHash = toHashUserEmail(userEmail, signInEmailLinkMethod);
	const { user, dbError: dbUserGetError } = await dbUserGetByEmailHash({ emailHash });
	if (dbUserGetError) {
		return error(500, { message: dbUserGetError.message });
	} else if (user) {
		if (user.id === userId) {
			return error(400, { message: 'You are using this email address' });
		} else {
			return error(400, { message: 'This email is in use by another user' });
		}
	}

	// Change user email
	const { dbError: dbUserUpdateError } = await dbUserProvideDataUpdate({
		userId,
		emailEncrypt,
		emailHash,
		emailVerified: true
	});
	if (dbUserUpdateError) {
		return error(500, { message: dbUserUpdateError.message });
	}

	// Delete dangling verification token
	const { dbError: dbVerifyDeleteError } = await dbVerificationTokenDelete({
		identifier: verificationToken.identifier,
		token: verificationToken.token
	});
	if (dbVerifyDeleteError) {
		return error(500, { message: dbVerifyDeleteError.message });
	}

	redirect(303, url.origin + setLanguageTagToPath('/mypage/security/email', url));
};
