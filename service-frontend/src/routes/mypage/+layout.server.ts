import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.auth();

	if (!session?.user) {
		throw error(401, { message: 'Unauthorized' });
	}

	return {
		session
	};
};
