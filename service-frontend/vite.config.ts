import fs from 'fs';
import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		paraglide({
			project: './i18n/service.inlang',
			outdir: './i18n/output'
		}),
		sveltekit(),
		Icons({ compiler: 'svelte' })
	],
	server: {
		host: true, // Access inside container
		proxy: {},
		fs: {
			allow: ['./i18n']
		},
		https: {
			key: fs.readFileSync('./localhost-key.pem'),
			cert: fs.readFileSync('./localhost.pem')
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
