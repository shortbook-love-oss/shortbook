import prisma from '$lib/prisma/connect';

export interface DbBookGetMinimumRequest {
	bookId: string;
	isIncludeDelete?: boolean;
}

export async function dbBookGetMinimum(req: DbBookGetMinimumRequest) {
	let dbError: Error | undefined;

	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	const book = await prisma.books
		.findUnique({
			where: {
				id: req.bookId,
				...whereCondDelete
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get book. Book ID=${req.bookId}`);
			return undefined;
		});

	return { book, dbError };
}
