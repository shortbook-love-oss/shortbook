export const signInProviders = [
	{ key: 'google', label: 'Google' },
	{ key: 'linkedin', label: 'LinkedIn' },
	{ key: 'github', label: 'GitHub' }
];

export function isSigninProviderKey(key: string) {
	return signInProviders.find((provider) => {
		return provider.key === key;
	});
}
