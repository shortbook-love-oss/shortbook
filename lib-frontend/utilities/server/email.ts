import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { env } from '$env/dynamic/private';

export async function sendEmail(
	from: string,
	to: string[],
	subject: string,
	bodyHtml: string,
	bodyText: string
) {
	const sesClient = new SESClient({
		region: 'us-west-2', // @todo env.AWS_REGION
		// region: env.AWS_REGION,
		credentials: {
			accessKeyId: env.AWS_SES_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SES_SECRET_ACCESS_KEY
		}
	});

	const sendEmailCommand = new SendEmailCommand({
		Source: from,
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
	try {
		result = await sesClient.send(sendEmailCommand);
	} catch (caught) {
		if (caught instanceof Error && caught.name === 'MessageRejected') {
			throw caught;
		}
		throw new Error('Uncaught error on send message.');
	}

	return result;
}
