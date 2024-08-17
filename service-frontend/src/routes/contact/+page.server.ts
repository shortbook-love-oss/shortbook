import { redirect } from '@sveltejs/kit';
import { setLanguageTagToPath } from '$lib/utilities/url';

export const load = async ({ url }) => {
	redirect(301, setLanguageTagToPath(`/support/contact${url.search}`, url));
};
