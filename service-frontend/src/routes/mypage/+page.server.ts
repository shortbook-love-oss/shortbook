import { redirect } from '@sveltejs/kit';

export const load = function (param) {
	redirect(302, param.url.pathname + '/personnel/profile');
}
