import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import 'dotenv/config';

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
				'form-action': [
					'self',
					'https://github.com/login/oauth/',
					'https://www.linkedin.com/oauth/'
				],
				'frame-ancestors': ['none'], // For click-jacking protection
				'script-src': ['self'],
				'worker-src': ['self'],
				'connect-src': ['self', 'wss://localhost:*'],
				'style-src': ['self', 'unsafe-inline'],
				'img-src': ['self', 'data:', 'blob:', process.env.PUBLIC_ORIGIN_PROFILE_IMAGE],
				'media-src': ['self', 'data:'],
				'object-src': ['self'],
				'font-src': ['self', 'data:'],
				'default-src': ['self']
			}
		}
	}
};

export default config;
