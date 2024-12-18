import { redirect } from '@sveltejs/kit';
import { setLanguageTagToPath } from '$lib/utilities/url';

export const load = async ({ url }) => {
	const redirectPath = setLanguageTagToPath(`/policies/term`, url);
	redirect(301, redirectPath);
};
