import prisma from '$lib/prisma/connect';

type IdExclusiveProps =
	| {
			bookId: string;
			userId?: never;
	  }
	| {
			bookId?: never;
			userId: string;
	  };
type Base = {
	isIncludeDelete?: boolean;
};

export type DbBookBuyListRequest = Base & IdExclusiveProps;

export async function dbBookBuyList(req: DbBookBuyListRequest) {
	let dbError: Error | undefined;

	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	const bookBuys = await prisma.book_buys
		.findMany({
			where: {
				book_id: req.bookId,
				user_id: req.userId,
				...whereCondDelete
			}
		})
		.catch(() => {
			dbError ??= new Error(
				`Failed to get book buy histories. User ID=${req.userId} and Book ID=${req.bookId}`
			);
			return undefined;
		});

	return { bookBuys, dbError };
}
