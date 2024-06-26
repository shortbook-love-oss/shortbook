import { redirect } from '@sveltejs/kit';

export async function load({ locals, url }) {
	const session = await locals.auth();

	// This page will not be displayed even if a signed-in user goes back in history
	if (session?.user) {
		const callbackUrl = url.searchParams.get('callbackUrl');
		if (callbackUrl) {
			redirect(303, callbackUrl);
		}
	}
}
