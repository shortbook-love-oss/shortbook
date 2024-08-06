import type { Cookies } from '@sveltejs/kit';
import { setOption, keyAuthUserId } from '$lib/utilities/cookie';
import { env } from '$env/dynamic/private';
import { encryptAndFlat, decryptFromFlat } from '$lib/utilities/server/crypto';

/** Don't call from client-side code */

export function setAuthUserId(cookie: Cookies, value: string) {
	const encryptedValue = encryptAndFlat(value, env.ENCRYPT_USER_ID, env.ENCRYPT_SALT);
	cookie.set(keyAuthUserId, encryptedValue, setOption);
}

export function getAuthUserId(cookie: Cookies) {
	const encryptedValue = cookie.get(keyAuthUserId);
	if (!encryptedValue) {
		return '';
	}
	return decryptFromFlat(encryptedValue, env.ENCRYPT_USER_ID, env.ENCRYPT_SALT);
}
