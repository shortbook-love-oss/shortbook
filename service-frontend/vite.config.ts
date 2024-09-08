import fs from 'fs';
import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		paraglide({
			project: './lib-frontend/i18n/project.inlang',
			outdir: './lib-frontend/i18n/paraglide'
		}),
		sveltekit(),
		Icons({ compiler: 'svelte' })
	],
	server: {
		host: true, // Access inside container
		proxy: {},
		https: {
			key: fs.readFileSync('./localhost-key.pem'),
			cert: fs.readFileSync('./localhost.pem')
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
