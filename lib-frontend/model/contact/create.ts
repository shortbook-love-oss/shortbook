import prisma from '$lib/prisma/connect';
import { logActionName } from '$lib/utilities/contact';

export interface DbTicketCreateRequest {
	categoryKeyName: string;
	emailEncrypt: string;
	description: string;
	languageCode: string;
	fileUrls: string[];
	ipAddressHash: string;
}

export async function dbTicketCreate(req: DbTicketCreateRequest) {
	let dbError: Error | undefined;

	const ticket = await prisma
		.$transaction(async (tx) => {
			const ticket = await tx.tickets.create({
				data: {
					category_key_name: req.categoryKeyName,
					email: req.emailEncrypt,
					description: req.description,
					language_code: req.languageCode
				}
			});
			await tx.log_actions.create({
				data: {
					action_name: logActionName,
					ip_address_hash: req.ipAddressHash
				}
			});
			return ticket;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to create support ticket.`);
			return undefined;
		});

	return { ticket, dbError };
}
