import prisma from '$lib-backend/database/connect';

export interface DbTicketCreateRequest {
	categoryKeyName: string;
	emailEncrypt: string;
	description: string;
	fromLanguage: string;
	fileUrls: string[];
}

export async function dbTicketCreate(req: DbTicketCreateRequest) {
	let dbError: Error | undefined;

	const ticket = await prisma.tickets
		.create({
			data: {
				category_key_name: req.categoryKeyName,
				email: req.emailEncrypt,
				description: req.description,
				from_language_tag: req.fromLanguage,
				files: {
					createMany: {
						data: req.fileUrls.map((fileUrl) => ({
							file_url: fileUrl
						}))
					}
				}
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to create support ticket.`);
			return undefined;
		});

	return { ticket, dbError };
}
