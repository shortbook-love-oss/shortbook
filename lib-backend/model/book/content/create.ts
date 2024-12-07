import prisma from '$lib-backend/database/connect';
import type { AvailableLanguageTags } from '$lib/utilities/language';

export type DbBookContentCreateProp = {
	targetLanguage: AvailableLanguageTags;
	title: string;
	subtitle: string;
	freeArea: string;
	paidArea: string;
	salesArea: string;
};

export type DbBookContentCreateRequest = {
	revisionId: string;
	contents: DbBookContentCreateProp[];
};

export async function dbBookContentCreate(req: DbBookContentCreateRequest) {
	const { bookContents, dbError } = await prisma.book_contents
		.createMany({
			data: req.contents.map((content) => ({
				revision_id: req.revisionId,
				language_tag: content.targetLanguage,
				title: content.title,
				subtitle: content.subtitle,
				free_area_html: content.freeArea,
				paid_area_html: content.paidArea,
				sales_area_html: content.salesArea
			}))
		})
		.then((data) => ({
			bookContents: data,
			dbError: undefined
		}))
		.catch(() => {
			const dbError = new Error(`Failed to create book contents. revisionId=${req.revisionId}`);
			console.error(dbError);
			return {
				bookContents: undefined,
				dbError
			};
		});

	return { bookContents, dbError };
}
