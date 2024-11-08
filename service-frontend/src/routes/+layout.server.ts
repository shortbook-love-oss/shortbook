import { setOption } from '$lib/utilities/cookie';

export const load = async ({ cookies, locals }) => {
	if (process.env.NODE_ENV !== 'development') {
		// Force empty paraglide:lang for best privacy
		cookies.set('paraglide:lang', '', {
			...setOption,
			secure: false
		});
	}

	return { signInUser: locals.signInUser };
};
