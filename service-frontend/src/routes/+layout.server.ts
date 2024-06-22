import { keyUserId, setOption } from '$lib/utilities/cookie';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (session?.user) {
		event.cookies.set(keyUserId, session.user.id ?? '', setOption);
	}

	return {
		session
	};
};
