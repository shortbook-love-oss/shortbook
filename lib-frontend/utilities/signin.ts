import type { AvailableLanguageTags } from '$lib/utilities/language';

// for sign-in and sign-up
export const sendRateLimitCount = 10;
export const logActionName = 'SignInUpRequest';

export interface SignInUser {
	id: string;
	keyHandle: string;
	penName: string;
	email: string;
	imageSrc: string;
	nativeLanguage: AvailableLanguageTags;
}
