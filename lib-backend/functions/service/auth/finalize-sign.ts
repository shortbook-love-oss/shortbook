import type { Cookies } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { setSessionToken } from '$lib/utilities/cookie';
import { getRandom } from '$lib/utilities/crypto';
import { guessCurrencyByLang } from '$lib/utilities/currency';
import { getLanguageTagFromUrl, signConfirmTokenParam } from '$lib/utilities/url';
import { dbLogActionDelete } from '$lib-backend/model/log/action-delete';
import { dbUserSessionCreate } from '$lib-backend/model/user/session/create';
import { dbUserCreate } from '$lib-backend/model/user/create';
import { dbUserGetByEmailHash } from '$lib-backend/model/user/get-by-email-hash';
import { dbUserRestore } from '$lib-backend/model/user/restore';
import { dbUserProfileImageUpdate } from '$lib-backend/model/user/update-profile-image';
import { dbVerificationTokenDelete } from '$lib-backend/model/verification-token/delete';
import { dbVerificationTokenGet } from '$lib-backend/model/verification-token/get';
import { decryptFromFlat, encryptAndFlat, toHash } from '$lib-backend/utilities/crypto';
import { copyFile } from '$lib-backend/utilities/file';
import { toHashUserEmail } from '$lib-backend/utilities/email';
import { signMagicLogActionName } from '$lib-backend/utilities/log-action';
import { signInTokenName, signUpTokenName } from '$lib-backend/utilities/verification-token';
import type { SignResult } from './action-init';

export async function finalizeSign(
	requestUrl: URL,
	cookies: Cookies,
	ipAddress: string,
	isSignUp: boolean
): Promise<SignResult> {
	// Check token in url
	const token = requestUrl.searchParams.get(signConfirmTokenParam);
	const { verificationToken, dbError: dbVerifyGetError } = await dbVerificationTokenGet({
		identifier: isSignUp ? signUpTokenName : signInTokenName,
		token: token ?? '',
		userId: null
	});
	if (!verificationToken || dbVerifyGetError) {
		return { error: new Error('Not found') };
	}
	const userEmail = decryptFromFlat(
		verificationToken.token,
		env.ENCRYPT_EMAIL_USER,
		env.ENCRYPT_SALT
	);
	if (!userEmail) {
		return { error: new Error('Unauthorized') };
	}

	// Delete sign-in/up action log by same ip-address
	const { dbError: dbLogDeleteError } = await dbLogActionDelete({
		actionName: signMagicLogActionName,
		ipAddressHash: toHash(ipAddress, env.HASH_IP_ADDRESS)
	});
	if (dbLogDeleteError) {
		return { error: dbLogDeleteError };
	}

	// Delete dangling verification token
	const { dbError: dbVerifyDeleteError } = await dbVerificationTokenDelete({
		identifier: verificationToken.identifier,
		token: verificationToken.token
	});
	if (dbVerifyDeleteError) {
		return { error: dbVerifyDeleteError };
	}

	let userId = '';
	if (isSignUp) {
		const nativeLanguage = getLanguageTagFromUrl(requestUrl);
		// Create user with random profile
		// If email exist, fail to user create
		const { user, dbError: dbUserGetError } = await dbUserCreate({
			keyHandle: getRandom(16),
			penName: `User ${getRandom(6).toUpperCase()}`,
			emailEncrypt: encryptAndFlat(userEmail, env.ENCRYPT_EMAIL_USER, env.ENCRYPT_SALT),
			emailHash: toHashUserEmail(userEmail),
			imageSrc: '',
			nativeLanguage,
			currency: guessCurrencyByLang(nativeLanguage)
		});
		if (!user || dbUserGetError) {
			return { error: new Error(dbUserGetError?.message ?? '') };
		}
		userId = user.id;
		const profileImagePath = `${userId}/shortbook-profile`;

		// Copy profile image to user's directory
		const { error: copyFileError } = await copyFile(
			env.AWS_DEFAULT_REGION,
			env.AWS_BUCKET_IMAGE_PROFILE,
			'initial/shortbook-profile',
			profileImagePath
		);
		if (copyFileError) {
			return { error: new Error(copyFileError.message) };
		}

		const { dbError: dbImageUpdateError } = await dbUserProfileImageUpdate({
			userId,
			imageSrc: `/profile/${profileImagePath}`
		});
		if (dbImageUpdateError) {
			return { error: new Error(dbImageUpdateError.message) };
		}
	} else {
		// Get user
		const { user, dbError: dbUserGetError } = await dbUserGetByEmailHash({
			emailHash: toHashUserEmail(userEmail),
			isIncludeDelete: true
		});
		if (!user || dbUserGetError) {
			return { error: new Error(dbUserGetError?.message ?? '') };
		}
		// Restore user if soft-deleted
		const { dbError: dbRestoreError } = await dbUserRestore({ userId: user.id });
		if (dbRestoreError) {
			return { error: new Error(dbRestoreError.message) };
		}
		userId = user.id;
	}

	// Create auth-session
	const sessionToken = crypto.randomUUID();
	const after1Year = new Date();
	after1Year.setFullYear(after1Year.getFullYear() + 1);
	const { userSession, dbError: dbSessionCreateError } = await dbUserSessionCreate({
		sessionToken,
		userId,
		expires: after1Year
	});
	if (!userSession || dbSessionCreateError) {
		return { error: new Error(dbSessionCreateError?.message ?? '') };
	}

	// Set session token to cookie
	setSessionToken(cookies, userSession.session_token);

	return { error: null };
}
