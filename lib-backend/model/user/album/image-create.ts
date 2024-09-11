import prisma from '$lib-backend/database/connect';

export interface DbUserAlbumImageCreateRequest {
	userId: string;
	name: string;
	filePath: string;
	width: number;
	height: number;
	mimeType: string;
	checksum: string;
}

export async function dbUserAlbumImageCreate(req: DbUserAlbumImageCreateRequest) {
	let dbError: Error | undefined;

	const albumImage = await prisma.user_images
		.create({
			data: {
				user_id: req.userId,
				name: req.name,
				alt: '',
				image_created_at: null,
				language_in_image: '',
				place: '',
				license_url: '',
				credit_notice: '',
				is_sensitive: 0,
				is_ai: 0,
				property: {
					create: {
						file_path: req.filePath,
						width: req.width,
						height: req.height,
						mime_type: req.mimeType,
						checksum: req.checksum
					}
				}
			}
		})
		.catch((error: Error) => {
			dbError ??= new Error(`Failed to create user album image. User ID=${req.userId}`);
			return undefined;
		});

	return { albumImage, dbError };
}
