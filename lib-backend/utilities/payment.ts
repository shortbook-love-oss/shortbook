import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';
import type { CurrencySupportCodes } from '$lib/utilities/currency';
import { reversePaymentAmountOfStripe, toPaymentAmountOfStripe } from '$lib/utilities/payment';
import { paymentSessionIdParam } from '$lib/utilities/url';

/** Don't call from client-side code */

export const stripe = new Stripe(env.STRIPE_STANDARD_KEY_SECRET, {
	apiVersion: '2024-09-30.acacia',
	telemetry: false
});

export async function createPaymentSession(
	paymentName: string,
	paymentDescription: string,
	paymentTaxCode: string,
	currencyCode: CurrencySupportCodes,
	paymentAmount: number,
	customerId: string,
	customerEmail: string,
	successUrl: string,
	cancelUrl: string
) {
	const amountForStripe = toPaymentAmountOfStripe(paymentAmount, currencyCode);

	let successUrlWithSession = successUrl;
	// See about {CHECKOUT_SESSION_ID} https://docs.stripe.com/payments/checkout/custom-success-page
	if (new URL(successUrl).searchParams.size > 0) {
		successUrlWithSession += `&${paymentSessionIdParam}={CHECKOUT_SESSION_ID}`;
	} else {
		successUrlWithSession += `?${paymentSessionIdParam}={CHECKOUT_SESSION_ID}`;
	}

	const checkoutCreateParam: Stripe.Checkout.SessionCreateParams = {
		line_items: [
			{
				price_data: {
					currency: currencyCode,
					unit_amount_decimal: amountForStripe,
					tax_behavior: 'inclusive',
					product_data: {
						name: paymentName,
						description: paymentDescription,
						images: [`${envPublic.PUBLIC_ORIGIN}/assets/shortbook-logo-bg.png`],
						tax_code: paymentTaxCode
					}
				},
				quantity: 1
			}
		],
		mode: 'payment',
		automatic_tax: { enabled: true },
		success_url: successUrlWithSession,
		cancel_url: cancelUrl
	};
	if (customerId) {
		checkoutCreateParam.customer = customerId;
	} else {
		// Create customer account in Stripe, not guest
		checkoutCreateParam.customer_creation = 'always';
		if (customerEmail) {
			// On user's first payment, auto-complete email
			checkoutCreateParam.customer_email = customerEmail;
		}
	}

	return await stripe.checkout.sessions.create(checkoutCreateParam);
}

export async function checkPaymentStatus(paymentSessionId: string) {
	const checkoutSession = await stripe.checkout.sessions.retrieve(paymentSessionId, {
		// Retrieve the Checkout Session from the API with line_items expanded
		expand: ['line_items']
	});

	const actuallyAmount = reversePaymentAmountOfStripe(
		checkoutSession.amount_total ?? 0,
		checkoutSession.currency as CurrencySupportCodes
	);

	let customerId = '';
	if (typeof checkoutSession.customer === 'string') {
		customerId = checkoutSession.customer;
	} else {
		customerId = checkoutSession.customer?.id ?? '';
	}

	// checkoutSession.payment_status === 'no_payment_required'
	// The payment is delayed to a future date, or the Checkout Session is in setup mode and doesn’t require a payment at this time.
	// checkoutSession.payment_status === 'paid'
	// The payment funds are available in your account.
	// checkoutSession.payment_status === 'unpaid'
	// The payment funds are not yet available in your account.
	return {
		paymentSessionId: checkoutSession.id,
		currency: (checkoutSession.currency ?? '') as CurrencySupportCodes | '',
		amount: actuallyAmount,
		customerId,
		isCreateCustomer: checkoutSession.customer_creation != null,
		isAvailable: checkoutSession.payment_status !== 'unpaid'
	};
}

export async function changeCustomerEmail(customerId: string, newEmail: string) {
	await stripe.customers.update(customerId, { email: newEmail });
}
