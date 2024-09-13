import prisma from '$lib-backend/database/connect';

export interface DbUserAlbumImageDeleteRequest {
	userId: string;
	imageId: string;
}

export async function dbUserAlbumImageDelete(req: DbUserAlbumImageDeleteRequest) {
	let dbError: Error | undefined;

	const beforeAlbumImage = await prisma.user_images.findUnique({
		where: {
			id: req.imageId,
			deleted_at: null
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

	await prisma
		.$transaction(async (tx) => {
			const deletedAt = new Date();

			const albumImage = await tx.user_images.update({
				where: {
					id: req.imageId,
					deleted_at: null
				},
				data: {
					deleted_at: deletedAt
				}
			});
			await tx.user_image_properties.updateMany({
				where: {
					image_id: albumImage.id,
					deleted_at: null
				},
				data: {
					deleted_at: deletedAt
				}
			});
			await tx.user_image_licenses.updateMany({
				where: {
					image_id: albumImage.id,
					deleted_at: null
				},
				data: {
					deleted_at: deletedAt
				}
			});
			await tx.user_image_tags.updateMany({
				where: {
					image_id: albumImage.id,
					deleted_at: null
				},
				data: {
					deleted_at: deletedAt
				}
			});
		})
		.catch(() => {
			dbError ??= new Error(`Failed to delete user album image. User ID=${req.userId}`);
		});

	return { dbError };
}
