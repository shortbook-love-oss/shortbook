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
	}
};

export default config;
