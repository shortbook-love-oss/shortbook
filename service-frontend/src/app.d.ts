import 'unplugin-icons/types/svelte';
import type { AvailableLanguageTags } from '$lib/utilities/language';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			signInUser: {
				id: string;
				keyHandle: string;
				penName: string;
				email: string;
				imageSrc: string;
				nativeLanguage: AvailableLanguageTags;
			} | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
