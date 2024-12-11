import prisma from '$lib-backend/database/connect';
import type { AvailableLanguageTags } from '$lib/utilities/language';

type DbBookContentGetRequest = {
	revisionId: string;
	language: AvailableLanguageTags;
	isIncludeDelete?: boolean;
};

export async function dbBookContentGet(req: DbBookContentGetRequest) {
	let dbError: Error | undefined;

	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	const bookContent = await prisma.book_contents
		.findUnique({
			where: {
				revision_id_language_tag: {
					revision_id: req.revisionId,
					language_tag: req.language
				},
				...whereCondDelete
			}
		})
		.catch(() => {
			dbError ??= new Error(
				`Failed to get book. Book revision ID=${req.revisionId}, Language=${req.language}`
			);
			return undefined;
		});

	return { bookContent, dbError };
}
