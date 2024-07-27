import { fail, error } from '@sveltejs/kit';
import DOMPurify from 'isomorphic-dompurify';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { env } from '$env/dynamic/private';
import { dbTicketCreate } from '$lib/model/contact/create';
import { dbLogActionList } from '$lib/model/log/action-list';
import { schema } from '$lib/validation/schema/contact-create';
import { encrypt, toHash } from '$lib/utilities/server/crypto';
import { sendEmail } from '$lib/utilities/server/email';
import { fileUpload } from '$lib/utilities/server/file';
import { sendRateLimitPerHour, logActionName, contactCategorySelect } from '$lib/utilities/contact';
import { guessNativeLangFromRequest } from '$lib/utilities/language';

export const load = async ({ getClientAddress }) => {
	const ipAddressHash = toHash(await getClientAddress());
	const form = await superValidate(zod(schema));

	// Disable submit button if rate limit exceeded
	const before1Hour = new Date();
	before1Hour.setHours(before1Hour.getHours() - 1);
	const { logActions, dbError } = await dbLogActionList({
		actionName: logActionName,
		ipAddressHash,
		dateFrom: before1Hour
	});
	if (!logActions || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	const isHitLimitRate = logActions.length > sendRateLimitPerHour;

	form.data.categoryKeyName = contactCategorySelect[0].value;
	form.data.email = '';
	form.data.description = '';

	return { form, isHitLimitRate, contactCategories: contactCategorySelect };
};

export const actions = {
	default: async ({ request, getClientAddress }) => {
		const ipAddressHash = toHash(await getClientAddress());
		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			// Block if rate limit exceeded
			const before1Hour = new Date();
			before1Hour.setHours(before1Hour.getHours() - 1);
			const { logActions, dbError } = await dbLogActionList({
				actionName: logActionName,
				ipAddressHash,
				dateFrom: before1Hour
			});
			if (!logActions || dbError) {
				return error(500, { message: dbError?.message ?? '' });
			}
			if (logActions.length > sendRateLimitPerHour) {
				message(form, 'Too many submissions. Please try again in an hour.');
				return fail(400, { form });
			}
		}
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		const emailEncrypt = encrypt(form.data.email, env.ENCRYPT_PASSWORD_USER_ID, env.ENCRYPT_SALT);

		// Upload files to Amazon S3
		const savedFileUrls = [];
		// e.g. "zjmt1a15ezf975xyc091ykird5"
		const filesKey = [...crypto.getRandomValues(new Uint32Array(4))]
			.map((v) => v.toString(36))
			.join('');
		for (const file of form.data.files ?? []) {
			const saveFilePath = `${filesKey}/${file.name.replace('/', '')}`;
			const isSuccessUpload = await fileUpload(
				env.AWS_BUCKET_CONTACT_TICKET_ATTACH,
				saveFilePath,
				file
			);
			if (!isSuccessUpload) {
				return error(500, { message: "Can't upload profile image. Please contact us." });
			}
			// Save as decoded (=original) URL string
			const fullPath = `https://${env.AWS_BUCKET_CONTACT_TICKET_ATTACH}.s3.${env.AWS_REGION}.amazonaws.com/${saveFilePath}`;
			savedFileUrls.push(fullPath);
		}

		const { dbError } = await dbTicketCreate({
			categoryKeyName: form.data.categoryKeyName,
			emailEncrypt: JSON.stringify(emailEncrypt),
			description: form.data.description,
			languageCode: guessNativeLangFromRequest(request),
			fileUrls: savedFileUrls,
			ipAddressHash
		});
		if (dbError) {
			return error(500, { message: dbError.message });
		}

		const sentDescription = DOMPurify.sanitize(form.data.description);
		await sendEmail(
			env.EMAIL_FROM,
			[form.data.email],
			'Your inquiry has been sent.',
			`<p>We will check your email and reply within 24 hours.</p><p>Here is your sent contents.</p><blockquote style="margin: 0 0 1em; padding: 16px; background-color: #eee; white-space: pre-wrap; overflow-wrap: break-word; color: #222;">${sentDescription}</blockquote><p>ShortBook LLC</p><p>Shunsuke Kurachi (KurachiWeb)</p>`,
			`We will check your email and reply within 24 hours.\n\nHere is your sent contents.\n\n${sentDescription}\n\nSincerely thank.\n\nShortBook LLC\nShunsuke Kurachi (KurachiWeb)`
		);

		return message(form, 'Inquiry sent successfully.');
	}
};
