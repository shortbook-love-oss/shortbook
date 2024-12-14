import 'unplugin-icons/types/svelte';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import type { SignInUser } from '$lib/utilities/signin';

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			signInUser: SignInUser | null;
			isMypage: boolean;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
