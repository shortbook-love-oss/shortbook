import prisma from '$lib-backend/database/connect';
import type { AvailableLanguageTags } from '$lib/utilities/language';

export interface DbUserAlbumImageUpdateRequest {
	userId: string;
	imageId: string;
	name: string;
	alt: string;
	languageInImage: AvailableLanguageTags | '';
	place: string;
	licenseUrl: string;
	creditNotice: string;
	isSensitive: number;
	isAi: number;
}

export async function dbUserAlbumImageUpdate(req: DbUserAlbumImageUpdateRequest) {
	let dbError: Error | undefined;

	const beforeAlbumImage = await prisma.user_images.findUnique({
		where: {
			id: req.imageId
		}
	});
	if (!beforeAlbumImage) {
		return { dbError: new Error(`Can't find album image. Image ID=${req.imageId}`) };
	}
	if (req.userId && req.userId !== beforeAlbumImage.user_id) {
		return {
			dbError: new Error(`Can't update image uploaded by another user. Image ID=${req.imageId}`)
		};
	}

	const albumImage = await prisma
		.$transaction(async (tx) => {
			const albumImage = await tx.user_images.update({
				where: {
					id: req.imageId
				},
				data: {
					user_id: req.userId,
					name: req.name,
					alt: req.alt,
					image_created_at: null,
					language_in_image: req.languageInImage,
					place: req.place,
					license_url: req.licenseUrl,
					credit_notice: req.creditNotice,
					is_sensitive: req.isSensitive,
					is_ai: req.isAi
				}
			});

			return albumImage;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to update user album image. User ID=${req.userId}`);
			return undefined;
		});

	return { albumImage, dbError };
}
