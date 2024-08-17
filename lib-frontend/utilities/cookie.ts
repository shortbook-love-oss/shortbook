import type { CookieSerializeOptions } from 'cookie';
import type { Cookies } from '@sveltejs/kit';

export const setOption: CookieSerializeOptions & { path: string } = {
	httpOnly: true,
	secure: true,
	path: '/',
	maxAge: 86400 * 365,
	sameSite: 'lax'
};

export const keySessionToken = '__Secure-authjs.session-token';
export function getSessionToken(cookie: Cookies) {
	return cookie.get(keySessionToken) ?? '';
}
export function setSessionToken(cookie: Cookies, value: string) {
	cookie.set(keySessionToken, value, setOption);
}
export function deleteSessionToken(cookie: Cookies) {
	cookie.delete(keySessionToken, setOption);
}
