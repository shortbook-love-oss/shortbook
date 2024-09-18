export const signInEmailLinkMethod = 'emaillink';
export const signInProviders = [
	{ key: 'google', label: 'Google' }
] as const;

export function matchSigninProvider(key: string) {
	return signInProviders.find((provider) => {
		return provider.key === key.toLowerCase();
	});
}

// for sign-in and sign-up
export const sendRateLimitCount = 10;
export const logActionName = 'SignInUpRequest';
