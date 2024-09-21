import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),

		files: {
			// $lib alias change './src/lib' to './lib'
			lib: 'lib-frontend',
			assets: 'lib-frontend/static'
		},

		alias: {
			$i18n: 'i18n',
			'$lib-backend': 'lib-backend'
		},

		csp: {
			mode: 'hash',
			directives: {
				'base-uri': ['self'],
				'form-action': ['self', 'https://checkout.stripe.com'],
				'frame-src': ['self', 'https://js.stripe.com'],
				'frame-ancestors': ['none'], // For click-jacking protection
				'script-src': ['self', 'https://js.stripe.com'],
				'worker-src': ['self'],
				'connect-src': ['self', 'wss://localhost:*'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'blob:', 'https:'],
				'media-src': ['self', 'data:'],
				'object-src': ['self'],
				'font-src': ['self', 'data:'],
				'default-src': ['self']
			}
		}
	},

	compilerOptions: {
		runes: true
	},

	vitePlugin: {
		dynamicCompileOptions({ filename }) {
			// Disabled rune mode in node_modules/*
			if (filename.includes('node_modules')) {
				return { runes: undefined };
			}
		}
	}
};

export default config;
