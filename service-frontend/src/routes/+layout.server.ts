import { setOption } from '$lib/utilities/cookie';

export const load = async ({ cookies, locals }) => {
	// Force empty paraglide:lang for best privacy
	cookies.set('paraglide:lang', '', {
		...setOption,
		secure: false
	});

	return {
		session: locals.session
	};
};
