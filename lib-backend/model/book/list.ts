import { Prisma } from '@prisma/client';
import prisma from '$lib-backend/database/connect';

export interface DbBookListRequest {
	bookIds?: string[];
	userId?: string;
	statuses?: number[]; // 0: Draft 1: Published
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
	if (req.statuses) {
		whereByCond.revisions = {
			some: {
				status: { in: req.statuses }
			}
		};
	}
	const revisionWhereByCond: Prisma.book_revisionsWhereInput = {};
	if (req.statuses) {
		revisionWhereByCond.status = { in: req.statuses };
	}
	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	let getRevisionsCount = 1;
	if (req.statuses == undefined || req.statuses.some((status) => status !== 1)) {
		// Get latest draft and previos published
		getRevisionsCount = 2;
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
					take: getRevisionsCount,
					include: {
						cover: {
							where: { ...whereCondDelete }
						},
						contents: {
							where: { ...whereCondDelete },
							omit: {
								free_area: true,
								paid_area: true,
								sales_area: true
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
