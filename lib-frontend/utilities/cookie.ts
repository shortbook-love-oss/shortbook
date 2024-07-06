import type { CookieSerializeOptions } from 'cookie';
import type { Cookies } from '@sveltejs/kit';

export const setOption: CookieSerializeOptions & { path: string } = {
	httpOnly: true,
	secure: true,
	path: '/',
	sameSite: 'lax'
};

export const keyAuthUserId = 'auth-user-id';

export const keySessionToken = '__Secure-authjs.session-token';
export function getSessionToken(cookie: Cookies) {
	return cookie.get(keySessionToken) ?? '';
}
