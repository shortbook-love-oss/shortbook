import { Prisma } from '@prisma/client';
import prisma from '$lib/prisma/connect';

export interface DbBookListRequest {
	bookIds?: string[];
	userId?: string;
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
	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	const books = await prisma.books
		.findMany({
			where: {
				user_id: req.userId,
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
						image: true,
						profiles: {
							where: { ...whereCondDelete },
							select: {
								key_name: true,
								languages: {
									where: { ...whereCondDelete },
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
