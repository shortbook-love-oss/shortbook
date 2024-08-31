import type { Cookies } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dbLogActionDelete } from '$lib/model/log/action-delete';
import { dbUserSessionCreate } from '$lib/model/user/session/create';
import { dbUserCreate } from '$lib/model/user/create';
import { dbUserGetByEmailHash } from '$lib/model/user/get-by-email-hash';
import { dbVerificationTokenDelete } from '$lib/model/verification-token/delete';
import { dbVerificationTokenGet } from '$lib/model/verification-token/get';
import { getRandom } from '$lib/utilities/crypto';
import { decryptFromFlat, encryptAndFlat, toHash } from '$lib/utilities/server/crypto';
import { toHashUserEmail } from '$lib/utilities/server/email';
import { signMagicLogActionName } from '$lib/utilities/server/log-action';
import { signInTokenName, signUpTokenName } from '$lib/utilities/server/verification-token';
import { setSessionToken } from '$lib/utilities/cookie';
import { signInEmailLinkMethod } from '$lib/utilities/signin';
import { signConfirmTokenParam } from '$lib/utilities/url';
import type { SignResult } from './action-init';
import { dbUserRestore } from '$lib/model/user/restore';

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
		// Create user with random profile
		// If email exist, fail to user create
		const { user, dbError: dbUserGetError } = await dbUserCreate({
			emailEncrypt: encryptAndFlat(userEmail, env.ENCRYPT_EMAIL_USER, env.ENCRYPT_SALT),
			emailHash: toHashUserEmail(userEmail, signInEmailLinkMethod),
			emailVerified: new Date(),
			keyName: getRandom(16),
			penName: `User ${getRandom(6).toUpperCase()}`,
			profileImage: '/profile/initial/profile.png'
		});
		if (!user || dbUserGetError) {
			return { error: new Error(dbUserGetError?.message ?? '') };
		}
		userId = user.id;
	} else {
		// Get user
		const { user, dbError: dbUserGetError } = await dbUserGetByEmailHash({
			emailHash: toHashUserEmail(userEmail, signInEmailLinkMethod),
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
	after1Year.setDate(after1Year.getDate() + 1);
	const { userSession, dbError: dbSessionCreateError } = await dbUserSessionCreate({
		sessionToken,
		userId,
		expires: after1Year
	});
	if (!userSession || dbSessionCreateError) {
		return { error: new Error(dbSessionCreateError?.message ?? '') };
	}

	// Set session token to cookie
	setSessionToken(cookies, userSession.sessionToken);

	return { error: null };
}
