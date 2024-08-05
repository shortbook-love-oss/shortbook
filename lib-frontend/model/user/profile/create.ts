import prisma from '$lib/prisma/connect';

export interface DbUserProfileCreateRequest {
	userId: string;
	keyName: string;
	penName: string;
	selfIntroduction: string;
}

export async function dbUserProfileCreate(req: DbUserProfileCreateRequest) {
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
						self_introduction: req.selfIntroduction
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
