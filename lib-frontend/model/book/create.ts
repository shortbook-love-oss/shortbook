import prisma from '$lib/prisma/connect';

export interface DbBookCreateRequest {
	userId: string;
	status: number; // 0: Draft 1: Public 2: Fan club only
	nativeLanguage: string;
	title: string;
	prologue: string;
	content: string;
	salesMessage: string;
}

export async function dbBookCreateRequest(req: DbBookCreateRequest) {
	let dbError: Error | undefined;

	const book = await prisma
		.$transaction(async (tx) => {
			const book = await tx.books.create({
				data: {
					user_id: req.userId,
					status: req.status,
					price: 0,
					languages: {
						create: {
							language_code: req.nativeLanguage,
							thumbnail_url: '',
							title: req.title,
							prologue: req.prologue,
							content: req.content,
							sales_message: req.salesMessage
						}
					}
				}
			});

			return book;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to create book. User ID=${req.userId}`);
			return undefined;
		});

	return { book, dbError };
}
