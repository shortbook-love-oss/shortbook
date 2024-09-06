import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { env } from '$env/dynamic/private';
import { contactCategorySelect } from '$lib/utilities/contact';
import { getRandom } from '$lib/utilities/crypto';
import { escapeHTML } from '$lib/utilities/html';
import { getLanguageTagFromUrl, inquiryCategoryParam } from '$lib/utilities/url';
import { schema } from '$lib/validation/schema/support/ticket-create';
import { dbLogActionCreate } from '$lib-backend/model/log/action-create';
import { dbLogActionList } from '$lib-backend/model/log/action-list';
import { dbTicketCreate } from '$lib-backend/model/support/ticket-create';
import { uploadFile } from '$lib-backend/utilities/file';
import { encryptAndFlat, toHash } from '$lib-backend/utilities/crypto';
import { sendEmail } from '$lib-backend/utilities/email';
import { sendInquiryLogActionName, sendInquiryRateLimit } from '$lib-backend/utilities/log-action';

export const load = async ({ url, getClientAddress }) => {
	const ipAddressHash = toHash(await getClientAddress(), env.HASH_IP_ADDRESS);
	const form = await superValidate(zod(schema));
	const categoryAutoSelect = url.searchParams.get(inquiryCategoryParam);

	// Disable submit button if rate limit exceeded
	const before1Hour = new Date();
	before1Hour.setHours(before1Hour.getHours() - 1);
	const { logActions, dbError } = await dbLogActionList({
		actionName: sendInquiryLogActionName,
		ipAddressHash,
		dateFrom: before1Hour
	});
	if (!logActions || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}
	const isHitLimitRate = logActions.length >= sendInquiryRateLimit;

	let initCategoryKey = contactCategorySelect[0].value;
	if (categoryAutoSelect) {
		for (const item of contactCategorySelect) {
			if (item.value === categoryAutoSelect) {
				initCategoryKey = item.value;
				break;
			}
		}
	}

	form.data.categoryKeyName = initCategoryKey;
	form.data.email = '';
	form.data.description = '';

	return { form, isHitLimitRate, contactCategories: contactCategorySelect };
};

export const actions = {
	default: async ({ request, url, getClientAddress }) => {
		const requestLang = getLanguageTagFromUrl(url);
		const ipAddressHash = toHash(getClientAddress(), env.HASH_IP_ADDRESS);
		const form = await superValidate(request, zod(schema));
		if (form.valid) {
			// Block if rate limit exceeded
			const before1Hour = new Date();
			before1Hour.setHours(before1Hour.getHours() - 1);
			const { logActions, dbError } = await dbLogActionList({
				actionName: sendInquiryLogActionName,
				ipAddressHash,
				dateFrom: before1Hour
			});
			if (!logActions || dbError) {
				return error(500, { message: dbError?.message ?? '' });
			}
			if (logActions.length > sendInquiryRateLimit) {
				message(form, 'Too many submissions. Please try again in an hour.');
				return fail(400, { form });
			}
		}
		if (!form.valid) {
			message(form, 'There was an error. please check your input and resubmit.');
			return fail(400, { form });
		}

		// Upload files to Amazon S3
		const savedFileUrls = [];
		const filesKey = getRandom(32);
		for (const file of form.data.files ?? []) {
			const saveFilePath = `${filesKey}/${file.name.replace('/', '-')}`;
			const { isSuccessUpload, error: uploadFileError } = await uploadFile(
				new Uint8Array(await file.arrayBuffer()),
				file.type,
				env.AWS_DEFAULT_REGION,
				env.AWS_BUCKET_SUPPORT_TICKET_ATTACH,
				saveFilePath
			);
			if (uploadFileError || !isSuccessUpload) {
				return error(500, { message: "Can't upload profile image. Please contact us." });
			}
			// Save as decoded (=original) URL string
			const fullPath = `https://${env.AWS_BUCKET_SUPPORT_TICKET_ATTACH}.s3.${env.AWS_DEFAULT_REGION}.amazonaws.com/${saveFilePath}`;
			savedFileUrls.push(fullPath);
		}

		// Save log for rate limit
		const { dbError: dbLogCreateError } = await dbLogActionCreate({
			actionName: sendInquiryLogActionName,
			ipAddressHash
		});
		if (dbLogCreateError) {
			return error(500, { message: dbLogCreateError.message });
		}

		// Create support ticket
		const { dbError: dbTicketCreateError } = await dbTicketCreate({
			categoryKeyName: form.data.categoryKeyName,
			emailEncrypt: encryptAndFlat(form.data.email, env.ENCRYPT_EMAIL_INQUIRY, env.ENCRYPT_SALT),
			description: form.data.description,
			languageCode: requestLang,
			fileUrls: savedFileUrls
		});
		if (dbTicketCreateError) {
			return error(500, { message: dbTicketCreateError.message });
		}

		const sentDescription = form.data.description;
		await sendEmail(
			'ShortBook Support Team',
			env.EMAIL_FROM,
			[form.data.email],
			'Your inquiry has been sent.',
			`<p>We will check your email and reply within 24 hours.</p><p>Here is your sent contents.</p><blockquote style="margin: 0 0 1em; padding: 16px; background-color: #eee; white-space: pre-wrap; overflow-wrap: break-word; color: #222;">${escapeHTML(sentDescription)}</blockquote><p>ShortBook LLC</p><p>Shunsuke Kurachi (KurachiWeb)</p>`,
			`We will check your email and reply within 24 hours.\n\nHere is your sent contents.\n\n${sentDescription}\n\nSincerely thank.\n\nShortBook LLC\nShunsuke Kurachi (KurachiWeb)`
		);

		return message(form, 'Inquiry sent successfully.');
	}
};
