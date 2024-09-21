import prisma from '$lib-backend/database/connect';

export interface DbUserProfileUpdateRequest {
	userId: string;
	keyHandle: string;
	nativeLanguage: string;
	penName: string;
	headline: string;
	selfIntroduction: string;
}

export async function dbUserProfileUpdate(req: DbUserProfileUpdateRequest) {
	let dbError: Error | undefined;

	const user = await prisma
		.$transaction(async (tx) => {
			const user = await tx.users.update({
				where: {
					id: req.userId,
					deleted_at: null
				},
				data: {
					key_handle: req.keyHandle,
					pen_name: req.penName,
					native_language: req.nativeLanguage
				}
			});

			await tx.user_languages.deleteMany({
				where: {
					user_id: req.userId
				}
			});
			await tx.user_languages.createMany({
				data: [
					{
						user_id: req.userId,
						target_language: req.nativeLanguage,
						headline: req.headline,
						self_introduction: req.selfIntroduction
					}
				]
			});

			return user;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to update user profile. User ID=${req.userId}`);
			return undefined;
		});

	return { user, dbError };
}
