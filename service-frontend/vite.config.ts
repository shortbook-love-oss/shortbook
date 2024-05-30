import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [paraglide({ project: './lib/i18n/project.inlang', outdir: './lib/i18n/paraglide' }), sveltekit()],
	server: {
		host: true // Access inside container
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
