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
	const revisionWhereByCond: Prisma.book_revisionsWhereInput = {};
	if (req.isIncludeDraft) {
		revisionWhereByCond.status = { in: [0, 1] };
	} else {
		revisionWhereByCond.status = { in: [1] };
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
				revisions: {
					where: {
						...revisionWhereByCond,
						...whereCondDelete
					},
					orderBy: {
						number: 'desc'
					},
					take: req.isIncludeDraft ? 2 : 1, // Get latest draft and previos published
					include: {
						cover: {
							where: { ...whereCondDelete }
						},
						contents: {
							where: { ...whereCondDelete },
							omit: {
								prologue: true,
								content: true,
								sales_message: true
							}
						}
					}
				},
				user: {
					select: {
						key_handle: true,
						pen_name: true,
						image_src: true,
						languages: {
							where: { ...whereCondDelete },
							select: {
								target_language: true
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
