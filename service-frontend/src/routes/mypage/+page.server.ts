import { redirect } from '@sveltejs/kit';

export const load = function ({ url }) {
	redirect(302, `${url.pathname}/personnel/profile${url.search}`);
};
