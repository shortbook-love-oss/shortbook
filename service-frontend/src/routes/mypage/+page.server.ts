import { redirect } from '@sveltejs/kit';

export const load = function (param) {
	throw redirect(302, param.url.pathname + '/personnel/profile');
}
