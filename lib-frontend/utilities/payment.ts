export const paymentProviders = [{ key: 'stripe', label: 'Stripe' }] as const;

export function getPaymentProvider(key: string) {
	for (const provider of paymentProviders) {
		if (provider.key === key) {
			return provider;
		}
	}
	return null;
}
