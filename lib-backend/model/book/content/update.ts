import prisma from '$lib-backend/database/connect';
import type { AvailableLanguageTags } from '$lib/utilities/language';

export type DbBookContentUpdateRequest = {
	contentId: string;
	targetLanguage?: AvailableLanguageTags;
	title?: string;
	subtitle?: string;
	freeArea?: string;
	paidArea?: string;
	salesArea?: string;
	isIncludeDelete?: boolean;
};

export async function dbBookContentUpdate(req: DbBookContentUpdateRequest) {
	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	const { bookContent, dbError } = await prisma.book_contents
		.update({
			where: {
				...whereCondDelete,
				id: req.contentId
			},
			data: {
				target_language: req.targetLanguage,
				title: req.title,
				subtitle: req.subtitle,
				free_area_html: req.freeArea,
				paid_area_html: req.paidArea,
				sales_area_html: req.salesArea
			}
		})
		.then((data) => ({
			bookContent: data,
			dbError: undefined
		}))
		.catch(() => {
			const dbError = new Error(`Failed to create book contents. contentId=${req.contentId}`);
			console.error(dbError);
			return {
				bookContent: undefined,
				dbError
			};
		});

	return { bookContent, dbError };
}
