import prisma from '$lib-backend/database/connect';

export interface DbUserAlbumImageCreateRequest {
	userId: string;
	name: string;
	saveFileName: string;
	byteLength: number;
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
				in_image_language_tag: '',
				place: '',
				is_sensitive: 0,
				is_ai: 0,
				property: {
					create: {
						saved_file_name: req.saveFileName,
						byte_length: req.byteLength,
						width: req.width,
						height: req.height,
						mime_type: req.mimeType,
						checksum: req.checksum
					}
				},
				license: {
					create: {
						creator_type: 0,
						creator_name: '',
						copyright_owner: '',
						target_in_image: '',
						license_url: ''
					}
				}
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to create user album image. User ID=${req.userId}`);
			return undefined;
		});

	return { albumImage, dbError };
}
