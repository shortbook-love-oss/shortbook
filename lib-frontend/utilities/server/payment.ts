import { error } from '@sveltejs/kit';
import Stripe from 'stripe';
import { env } from '$env/dynamic/private';
import { dbCurrencyRateGet } from '$lib/model/currency/get';
import { decryptFromFlat } from '$lib/utilities/server/crypto';
import type { CurrencySupportKeys } from '$lib/utilities/currency';
import {
	decidePaymentAmountForStripe,
	reversePaymentAmountOfStripe,
	shortbookChargeFee
} from '$lib/utilities/payment';
import { paymentSessionIdParam } from '$lib/utilities/url';

/** Don't call from client-side code */

export const stripe = new Stripe(env.STRIPE_STANDARD_KEY_SECRET, {
	apiVersion: '2024-06-20',
	maxNetworkRetries: 2, // Challenge → Retry 1 → Retry 2 → Failed
	telemetry: false
});

export async function createPaymentSession(
	paymentName: string,
	paymentDescription: string,
	paymentTaxCode: string,
	currency: CurrencySupportKeys,
	pointAmount: number,
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

	// Need 100 USD + service fee to buy 100 point
	const pointAmountBase = (pointAmount / 100) * (100 / (100 - shortbookChargeFee));
	const { currencyRateIndex, dbError: dbRateGetError } = await dbCurrencyRateGet({
		amount: pointAmountBase
	});
	if (dbRateGetError) {
		error(500, { message: dbRateGetError.message });
	}
	const paymentAmount = (await decidePaymentAmountForStripe(currencyRateIndex))[currency];
	if (!paymentAmount) {
		// Doesn't support currency, just reload the page
		return { url: null };
	}

	const checkoutCreateParam: Stripe.Checkout.SessionCreateParams = {
		line_items: [
			{
				price_data: {
					currency,
					product_data: {
						name: paymentName,
						description: paymentDescription,
						images: [
							'https://profile-image.shortbook.life/shortbook/shortbook-logo-bg-white-wh512-margin64.png'
						],
						tax_code: paymentTaxCode
					},
					unit_amount_decimal: paymentAmount,
					tax_behavior: 'inclusive'
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

	let actuallyAmount = 0;
	if (checkoutSession.currency) {
		actuallyAmount =
			reversePaymentAmountOfStripe(
				checkoutSession.currency as CurrencySupportKeys,
				checkoutSession.amount_total ?? 0
			) ?? actuallyAmount;
	}

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
		currency: (checkoutSession.currency ?? '') as CurrencySupportKeys | '',
		amount: actuallyAmount,
		customerId,
		isCreateCustomer: checkoutSession.customer_creation != null,
		isAvailable: checkoutSession.payment_status !== 'unpaid'
	};
}

export async function changeCustomerEmail(customerId: string, newEmail: string) {
	await stripe.customers.update(
		decryptFromFlat(customerId, env.ENCRYPT_PAYMENT_CUSTOMER_ID, env.ENCRYPT_SALT),
		{ email: newEmail }
	);
}
