export const signInProviders = [
	{ key: 'google', label: 'Google' },
	{ key: 'linkedin', label: 'LinkedIn' },
	{ key: 'github', label: 'GitHub' }
];

export function matchSigninProvider(key: string) {
	return signInProviders.find((provider) => {
		return provider.key === key.toLowerCase();
	});
}

export const signUpTokenName = 'signUp';
export const signInTokenName = 'signIn';

// for sign-in and sign-up
export const sendRateLimitCount = 10;
export const logActionName = 'SignInUpRequest';
