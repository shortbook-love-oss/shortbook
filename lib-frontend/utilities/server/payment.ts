import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { paymentSessionIdParam } from '$lib/utilities/url';

/** Don't call from client-side code */

export const stripe = new Stripe(env.STRIPE_STANDARD_KEY_SECRET, { apiVersion: '2024-06-20' });

export async function createPaymentSession(
	priceId: string,
	quantity: number,
	customerId: string,
	customerEmail: string,
	successUrl: string,
	cancelUrl: string
) {
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
				// Provide the exact Price ID (for example, pr_1234) of the product you want to sell
				price: priceId,
				quantity
			}
		],
		mode: 'payment',
		success_url: successUrlWithSession,
		cancel_url: cancelUrl,
		automatic_tax: { enabled: true }
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

	// checkoutSession.payment_status === 'no_payment_required'
	// The payment is delayed to a future date, or the Checkout Session is in setup mode and doesn’t require a payment at this time.
	// checkoutSession.payment_status === 'paid'
	// The payment funds are available in your account.
	// checkoutSession.payment_status === 'unpaid'
	// The payment funds are not yet available in your account.
	let customerId = '';
	if (typeof checkoutSession.customer === 'string') {
		customerId = checkoutSession.customer;
	} else {
		customerId = checkoutSession.customer?.id ?? '';
	}

	return {
		paymentSessionId: checkoutSession.id,
		customerId,
		isCreateCustomer: checkoutSession.customer_creation != null,
		isAvailable: checkoutSession.payment_status !== 'unpaid'
	};
}
