import { superValidate } from 'sveltekit-superforms';
import { env } from '$env/dynamic/private';
import { dbUserGetByEmailHash } from '$lib/model/user/get-by-email-hash';
import { dbLogActionCreate } from '$lib/model/log/action-create';
import { dbLogActionList } from '$lib/model/log/action-list';
import { toHash } from '$lib/utilities/server/crypto';
import { toHashUserEmail } from '$lib/utilities/server/email';
import { signMagicLogActionName, signMagicRateLimit } from '$lib/utilities/server/log-action';
import { signInEmailLinkMethod } from '$lib/utilities/signin';

export interface SignResult {
	user?: Awaited<ReturnType<typeof dbUserGetByEmailHash>>['user'] | null;
	error: Error | null;
	fail?: string;
}

export async function beforeSign(
	form: Awaited<ReturnType<typeof superValidate<{ email: string }>>>,
	ipAddress: string
): Promise<SignResult> {
	const emailHash = toHashUserEmail(form.data.email, signInEmailLinkMethod);
	if (!form.valid) {
		return { error: null, fail: 'There was an error. please check your input and resubmit.' };
	}

	// 1. Block if rate limit exceeded
	const before1Hour = new Date();
	before1Hour.setHours(before1Hour.getHours() - 1);
	const { logActions, dbError: dbLogError } = await dbLogActionList({
		actionName: signMagicLogActionName,
		ipAddressHash: toHash(ipAddress, env.HASH_IP_ADDRESS),
		dateFrom: before1Hour
	});
	if (dbLogError) {
		return { error: dbLogError };
	}
	if (logActions && logActions.length >= signMagicRateLimit) {
		return { error: null, fail: 'Too many submissions. Please try again in an hour.' };
	}

	// 2. Check exist user by email
	const { user, dbError } = await dbUserGetByEmailHash({
		emailHash,
		isIncludeDelete: true
	});
	if (dbError) {
		return { error: dbError };
	}

	// 3. Save log for rate limit
	const { dbError: dbLogCreateError } = await dbLogActionCreate({
		actionName: signMagicLogActionName,
		ipAddressHash: toHash(ipAddress, env.HASH_IP_ADDRESS)
	});
	if (dbLogCreateError) {
		return { error: dbLogCreateError };
	}

	return { user, error: null };
}
