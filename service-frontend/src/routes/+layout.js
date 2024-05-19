import { loadTranslations } from '$lib/translations/translations';

/** @type {import('@sveltejs/kit').Load} */
export const load = async ({ url }) => {
	const { pathname } = url;
	const initLocale = navigator.language?.split('-')[0] || 'en';
	await loadTranslations(initLocale, pathname);
	return {};
};
