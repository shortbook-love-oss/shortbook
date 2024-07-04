import type { DefaultSession } from '@auth/sveltekit';
import type { ParaglideLocals } from '@inlang/paraglide-sveltekit';
import 'unplugin-icons/types/svelte';
import type { AvailableLanguageTag } from '$lib/paraglide/runtime';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			paraglide: ParaglideLocals<AvailableLanguageTag>;
			session: DefaultSession | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
