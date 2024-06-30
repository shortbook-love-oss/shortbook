import prisma from '$lib/prisma/connect';

export interface DbUserCreateRequest {
	userId: string;
	keyName: string;
	penName: string;
}

export async function dbUserProfileCreate(req: DbUserCreateRequest) {
	let dbError: Error | undefined;

	const user = await prisma.user_profiles
		.create({
			data: {
				user_id: req.userId,
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
		})
		.catch((e: Error) => {
			dbError = e;
			return undefined;
		});

	return { user, dbError };
}
