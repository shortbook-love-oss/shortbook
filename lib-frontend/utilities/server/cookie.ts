import type { Cookies } from '@sveltejs/kit';
import { setOption, keyAuthUserId } from '$lib/utilities/cookie';
import { env } from '$env/dynamic/private';
import { encrypt, decrypt } from '$lib/utilities/server/crypto';
import type { Encrypted } from '$lib/utilities/crypto';

/** Don't call from client-side code */

export function setAuthUserId(cookie: Cookies, value: string) {
	const encryptedValue = encrypt(value, env.ENCRYPT_PASSWORD_USER_ID, env.ENCRYPT_SALT);
	cookie.set(keyAuthUserId, JSON.stringify(encryptedValue), setOption);
}

export function getAuthUserId(cookie: Cookies) {
	const value = cookie.get(keyAuthUserId);
	if (!value) {
		return '';
	}
	const encrypted: Encrypted = JSON.parse(value);
	return decrypt(
		encrypted.encryptedData,
		encrypted.iv,
		env.ENCRYPT_PASSWORD_USER_ID,
		env.ENCRYPT_SALT
	);
}
