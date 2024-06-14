import { redirect } from '@sveltejs/kit';

export async function load({ url }) {
	throw redirect(302, url.pathname + '/personnel/profile');
}
