import prisma from '$lib/prisma/connect';

export interface DbUserCreateRequest {
	emailEncrypt: string;
	emailHash: string;
	emailVerified: Date;
	keyName: string;
	penName: string;
	profileImage: string;
}

export async function dbUserCreate(req: DbUserCreateRequest) {
	let dbError: Error | undefined;

	const user = await prisma.user
		.create({
			data: {
				name: req.penName,
				email: req.emailEncrypt,
				email_hash: req.emailHash,
				emailVerified: req.emailVerified,
				image: req.profileImage,
				profiles: {
					create: {
						key_name: req.keyName,
						native_language: '',
						location: '',
						languages: {
							create: {
								language_code: '',
								pen_name: req.penName,
								headline: '',
								self_introduction: ''
							}
						}
					}
				}
			}
		})
		.catch((e: Error) => {
			dbError = e;
			return undefined;
		});

	return { user, dbError };
}
