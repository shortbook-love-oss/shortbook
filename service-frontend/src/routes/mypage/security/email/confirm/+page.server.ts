import { error, redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { dbUserGetByEmailHash } from '$lib-backend/model/user/get-by-email-hash';
import { dbUserProvideDataUpdate } from '$lib-backend/model/user/update-provide-data';
import { dbVerificationTokenDelete } from '$lib-backend/model/verification-token/delete';
import { dbVerificationTokenGet } from '$lib-backend/model/verification-token/get';
import { signInEmailLinkMethod } from '$lib/utilities/signin';
import { emailChangeTokenParam, setLanguageTagToPath } from '$lib/utilities/url';
import { dbUserPaymentContractGet } from '$lib-backend/model/user/payment-contract/get';
import { decryptFromFlat, encryptAndFlat } from '$lib-backend/utilities/crypto';
import { toHashUserEmail } from '$lib-backend/utilities/email';
import { changeCustomerEmail } from '$lib-backend/utilities/payment';
import { emailChangeTokenName } from '$lib-backend/utilities/verification-token';

export const load = async ({ url, locals }) => {
	const userId = locals.session?.user?.id;
	if (!userId) {
		return error(401, { message: 'Unauthorized' });
	}

	// Check token in url
	const token = url.searchParams.get(emailChangeTokenParam);
	const { verificationToken, dbError: dbVerifyGetError } = await dbVerificationTokenGet({
		identifier: emailChangeTokenName,
		token: token ?? '',
		userId
	});
	if (!verificationToken || dbVerifyGetError) {
		return error(404, { message: 'Not found' });
	}
	const userEmail = decryptFromFlat(
		verificationToken.token,
		env.ENCRYPT_EMAIL_USER,
		env.ENCRYPT_SALT
	);
	if (!userEmail) {
		return error(401, { message: 'Unauthorized' });
	}

	// If already use email by another user, cancel process
	const emailEncrypt = encryptAndFlat(userEmail, env.ENCRYPT_EMAIL_USER, env.ENCRYPT_SALT);
	const emailHash = toHashUserEmail(userEmail, signInEmailLinkMethod);
	const { user, dbError: dbUserGetError } = await dbUserGetByEmailHash({ emailHash });
	if (dbUserGetError) {
		return error(500, { message: dbUserGetError.message });
	} else if (user) {
		if (user.id === userId) {
			return error(400, { message: 'You are using this email address' });
		} else {
			return error(400, { message: 'This email is in use by another user' });
		}
	}

	// Change user email
	const { dbError: dbUserUpdateError } = await dbUserProvideDataUpdate({
		userId,
		emailEncrypt,
		emailHash,
		emailVerified: true
	});
	if (dbUserUpdateError) {
		return error(500, { message: dbUserUpdateError.message });
	}

	// Change payment provider registerd email
	const { paymentContracts, dbError: dbContractGetError } = await dbUserPaymentContractGet({
		userId,
		providerKey: 'stripe'
	});
	if (!paymentContracts || dbContractGetError) {
		return error(500, { message: dbContractGetError?.message ?? '' });
	}
	await Promise.all(
		paymentContracts.map((paymentContract) => {
			const paymentCustomerId = decryptFromFlat(
				paymentContract.provider_customer_id,
				env.ENCRYPT_PAYMENT_CUSTOMER_ID,
				env.ENCRYPT_SALT
			);
			return changeCustomerEmail(paymentCustomerId, userEmail);
		})
	);

	// Delete dangling verification token
	const { dbError: dbVerifyDeleteError } = await dbVerificationTokenDelete({
		identifier: verificationToken.identifier,
		token: verificationToken.token
	});
	if (dbVerifyDeleteError) {
		return error(500, { message: dbVerifyDeleteError.message });
	}

	redirect(303, url.origin + setLanguageTagToPath('/mypage/security/email', url));
};
