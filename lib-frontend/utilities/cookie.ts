import type { Cookies } from '@sveltejs/kit';

export const setOption: import('cookie').CookieSerializeOptions & { path: string } = {
	httpOnly: true,
	secure: true,
	path: '/',
	sameSite: 'lax'
};

export const keyAuthUserId = 'auth-user-id';

export const keyUserId = 'user-id';
export function setUserId(cookie: Cookies, value: string) {
	return cookie.set(keyUserId, value, setOption);
}
export function getUserId(cookie: Cookies) {
	return cookie.get(keyUserId) ?? '';
}

export const keySessionToken = '__Secure-authjs.session-token';
export function getSessionToken(cookie: Cookies) {
	return cookie.get(keySessionToken) ?? '';
}
