export const keyUserId = 'user-id';

export const setOption: import('cookie').CookieSerializeOptions & { path: string } = {
	httpOnly: true,
	secure: true,
	path: '/',
	sameSite: 'lax'
};
