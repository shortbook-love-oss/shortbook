import type { Cookies } from '@sveltejs/kit';

export const keyUserId = 'user-id';

export const setOption: import('cookie').CookieSerializeOptions & { path: string } = {
	httpOnly: true,
	secure: true,
	path: '/',
	sameSite: 'lax'
};

export function getUserId(cookie: Cookies) {
	return cookie.get(keyUserId) ?? '';
}