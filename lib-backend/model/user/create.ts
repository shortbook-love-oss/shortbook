import prisma from '$lib-backend/database/connect';

export interface DbUserCreateRequest {
	keyHandle: string;
	penName: string;
	emailEncrypt: string;
	emailHash: string;
	imageSrc: string;
}

export async function dbUserCreate(req: DbUserCreateRequest) {
	let dbError: Error | undefined;

	const user = await prisma.users
		.create({
			data: {
				key_handle: req.keyHandle,
				pen_name: req.penName,
				email: req.emailEncrypt,
				email_hash: req.emailHash,
				native_language: '',
				image_src: req.imageSrc,
				languages: {
					create: {
						target_language: '',
						headline: '',
						self_introduction: ''
					}
				}
			}
		})
		.catch(() => {
			dbError ??= new Error(
				`Failed to create user. User handle=${req.keyHandle}, Pen name=${req.penName}`
			);
			return undefined;
		});

	return { user, dbError };
}
