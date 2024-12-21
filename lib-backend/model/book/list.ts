import { Prisma } from '@prisma/client';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import prisma from '$lib-backend/database/connect';

type IdExclusiveProps =
	| {
			bookIds?: string[];
			userId?: never;
	  }
	| {
			bookIds?: never;
			userId?: string;
	  };

export type DbBookListRequest = IdExclusiveProps & {
	statuses?: number[]; // 0: Draft 1: Published
	contentsLanguage?: AvailableLanguageTags;
	isIncludeAdmin?: boolean;
	isIncludeDelete?: boolean;
};

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
	if (!req.isIncludeAdmin) {
		revisionWhereByCond.book = { is_admin: false };
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

	prisma.translated_contents.findMany({
		where: {
			user_id: req.userId,
			language_tag: req.contentsLanguage,
			checksum: {
				in: ['8yeufhjd', 'ehbrijre']
			}
		}
	});

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
					orderBy: { number: 'desc' },
					take: getRevisionsCount,
					// Omit + include is work, but these props doesn't omit by type definition
					omit: {
						free_area: true,
						paid_area: true,
						sales_area: true
					},
					include: {
						contents: {
							where: {
								...whereCondDelete,
								language_tag: req.contentsLanguage
							},
							select: {
								language_tag: true,
								title: true,
								subtitle: true
							}
						},
						cover: {
							where: { ...whereCondDelete }
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
							select: { language_tag: true }
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
