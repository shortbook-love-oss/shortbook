import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import libmime from 'libmime';
import { env } from '$env/dynamic/private';
import { toHash } from '$lib-backend/utilities/crypto';

export async function sendEmail(
	senderName: string,
	from: string,
	to: string[],
	subject: string,
	bodyHtml: string,
	bodyText: string
) {
	const sesClient = new SESClient({
		region: env.AWS_DEFAULT_REGION,
		credentials: {
			accessKeyId: env.AWS_SES_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SES_SECRET_ACCESS_KEY
		}
	});

	const sendEmailCommand = new SendEmailCommand({
		Source: `${libmime.encodeWord(senderName, 'Q')} <${from}>`,
		Destination: {
			CcAddresses: [],
			ToAddresses: to
		},
		Message: {
			Body: {
				Html: {
					Charset: 'UTF-8',
					Data: bodyHtml
				},
				Text: {
					Charset: 'UTF-8',
					Data: bodyText
				}
			},
			Subject: {
				Charset: 'UTF-8',
				Data: subject
			}
		}
	});

	let result;
	let sendEmailError;
	try {
		result = await sesClient.send(sendEmailCommand);
	} catch (caught) {
		if (caught instanceof Error && caught.name === 'MessageRejected') {
			sendEmailError = caught;
		}
		sendEmailError = new Error('Uncaught error on send message.');
	}

	return { result, sendEmailError };
}

// Unique email-hash make by email + random suffix
export function toHashUserEmail(email: string) {
	return toHash(email, env.HASH_EMAIL_USER);
}
