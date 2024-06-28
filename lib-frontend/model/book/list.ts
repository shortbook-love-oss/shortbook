import prisma from '$lib/prisma/connect';

export interface DbBookListRequest {
	userId: string;
}

export async function dbBookList(req: DbBookListRequest) {
	let dbError: Error | undefined;

	const books = await prisma.books
		.findMany({
			where: {
				user_id: req.userId,
				deleted_at: null
			},
			include: {
				languages: {
					omit: {
						introduction: true,
						content: true,
						sales_message: true
					}
				},
				tags: true
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get books. User ID=${req.userId}`);
			return undefined;
		});

	return { books, dbError };
}
