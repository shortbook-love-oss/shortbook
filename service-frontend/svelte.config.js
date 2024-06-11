import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter(),

		files: {
			// $lib alias change './src/lib' to './lib'
			lib: 'lib',
			assets: 'lib/static'
		},

		csp: {
			mode: 'hash',
			directives: {
				'base-uri': ['self'],
				'connect-src': ['self', 'wss://localhost:*'],
				'script-src': ['self'],
				'style-src': ['self', 'unsafe-inline'],
				'media-src': ['self', 'data:'],
				'img-src': ['self', 'data:'],
				'object-src': ['self'],
				'font-src': ['self', 'data:'],
				'form-action': ['self'],
				'frame-ancestors': ['none'], // For click-jacking protection
				'default-src': ['self']
			}
		}
	}
};

export default config;
