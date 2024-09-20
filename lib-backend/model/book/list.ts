import { Prisma } from '@prisma/client';
import prisma from '$lib-backend/database/connect';

export interface DbBookListRequest {
	bookIds?: string[];
	userId?: string;
	isIncludeDraft?: boolean;
	isIncludeDelete?: boolean;
}

export async function dbBookList(req: DbBookListRequest) {
	let dbError: Error | undefined;

	const whereByCond: Prisma.booksWhereInput = {};
	if (req.userId) {
		whereByCond.user_id = req.userId;
	}
	if (req.bookIds?.length) {
		whereByCond.id = { in: req.bookIds };
	}
	if (req.isIncludeDraft) {
		whereByCond.status = { in: [0, 1] };
	} else {
		whereByCond.status = { in: [1] };
	}

	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	const books = await prisma.books
		.findMany({
			where: {
				...whereByCond,
				...whereCondDelete
			},
			orderBy: { updated_at: 'desc' },
			include: {
				cover: {
					where: { ...whereCondDelete }
				},
				languages: {
					where: { ...whereCondDelete },
					omit: {
						prologue: true,
						content: true,
						sales_message: true
					}
				},
				tags: {
					where: { ...whereCondDelete }
				},
				user: {
					select: {
						name: true,
						image: true,
						profiles: {
							where: { ...whereCondDelete },
							select: {
								key_name: true,
								languages: {
									where: { ...whereCondDelete },
									select: {
										language_code: true
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
