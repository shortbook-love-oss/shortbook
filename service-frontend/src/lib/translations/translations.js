import i18n from 'sveltekit-i18n';

/** @type {import('sveltekit-i18n').Config} */
const config = {
	loaders: [
		{
			locale: 'en',
			key: 'common',
			loader: async () => (await import('./common-en.json')).default
		},
		{
			locale: 'ja',
			key: 'common',
			loader: async () => (await import('./common-ja.json')).default
		},
		// Top --------------------------------------------------------
		{
			locale: 'en',
			key: 'index',
			routes: ['/'],
			loader: async () => (await import('./index/en.json')).default
		},
		{
			locale: 'ja',
			key: 'index',
			routes: ['/'],
			loader: async () => (await import('./index/ja.json')).default
		},
		// About --------------------------------------------------------
		{
			locale: 'en',
			key: 'about',
			routes: ['/about'],
			loader: async () => (await import('./about/en.json')).default
		},
		{
			locale: 'ja',
			key: 'about',
			routes: ['/about'],
			loader: async () => (await import('./about/ja.json')).default
		}
	]
};

export const { t, locale, locales, loading, loadTranslations } = new i18n(config);
