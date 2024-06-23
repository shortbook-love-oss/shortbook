import { error } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	const session = await locals.auth();

	if (!session?.user) {
		throw error(401, { message: 'Unauthorized' });
	}

	return {
		session
	};
};
