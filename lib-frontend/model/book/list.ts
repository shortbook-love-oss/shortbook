import prisma from '$lib/prisma/connect';

export interface DbBookListRequest {
	userId?: string;
}

export async function dbBookList(req: DbBookListRequest) {
	let dbError: Error | undefined;

	const books = await prisma.books
		.findMany({
			where: {
				user_id: req.userId,
				deleted_at: null
			},
			orderBy: {
				updated_at: 'desc'
			},
			include: {
				languages: {
					omit: {
						prologue: true,
						content: true,
						sales_message: true
					},
					where: { deleted_at: null }
				},
				tags: {
					where: { deleted_at: null }
				},
				user: {
					select: {
						image: true,
						profiles: {
							select: {
								key_name: true,
								languages: {
									select: {
										language_code: true,
										pen_name: true
									}
								}
							}
						}
					}
				}
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get books. User ID=${req.userId}`);
			return undefined;
		});

	return { books, dbError };
}
