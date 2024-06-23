import { keyUserId, setOption } from '$lib/utilities/cookie';

export const load = async ({ cookies, locals }) => {
	const session = await locals.auth();

	if (session?.user) {
		cookies.set(keyUserId, session.user.id ?? '', setOption);
	}

	return {
		session
	};
};
