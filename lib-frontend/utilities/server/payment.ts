import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { paymentSessionIdParam } from '$lib/utilities/url';

/** Don't call from client-side code */

export const stripe = new Stripe(env.STRIPE_STANDARD_KEY_SECRET);

export async function createPaymentSession(
	priceId: string,
	quantity: number,
	successUrl: string,
	cancelUrl: string
) {
	let successUrlWithSession = successUrl;
	if (new URL(successUrl).searchParams.size > 0) {
		successUrlWithSession += `&${paymentSessionIdParam}={CHECKOUT_SESSION_ID}`;
	} else {
		successUrlWithSession += `?${paymentSessionIdParam}={CHECKOUT_SESSION_ID}`;
	}
	return await stripe.checkout.sessions.create({
		line_items: [
			{
				// Provide the exact Price ID (for example, pr_1234) of the product you want to sell
				price: priceId,
				quantity
			}
		],
		// // @todo Save customer id into user_** table and put it here
		// customer: 'cus_XxXxXxXxXxX'
		// Create customer account in Stripe, not guest
		customer_creation: 'always',
		mode: 'payment',
		success_url: successUrlWithSession,
		cancel_url: cancelUrl,
		automatic_tax: { enabled: true }
	});
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
	return {
		paymentSessionId,
		isAvailable: checkoutSession.payment_status !== 'unpaid'
	};
}
