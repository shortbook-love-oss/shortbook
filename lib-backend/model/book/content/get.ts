import prisma from '$lib-backend/database/connect';
import type { AvailableLanguageTags } from '$lib/utilities/language';

type DbBookContentGetRequest = {
	revisionId: string;
	targetLanguage: AvailableLanguageTags;
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
				revision_id_target_language: {
					revision_id: req.revisionId,
					target_language: req.targetLanguage
				},
				...whereCondDelete
			}
		})
		.catch(() => {
			dbError ??= new Error(
				`Failed to get book. Book revision ID=${req.revisionId}, Language=${req.targetLanguage}`
			);
			return undefined;
		});

	return { bookContent, dbError };
}
