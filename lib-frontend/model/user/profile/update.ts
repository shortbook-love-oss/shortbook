import prisma from '$lib/prisma/connect';

export interface DbUserProfileUpdateRequest {
	userId: string;
	keyName: string;
	nativeLanguage: string;
	penName: string;
	headline: string;
	selfIntroduction: string;
}

export async function dbUserProfileUpdate(req: DbUserProfileUpdateRequest) {
	let dbError: Error | undefined;

	const profile = await prisma
		.$transaction(async (tx) => {
			const profile = await tx.user_profiles.update({
				where: {
					user_id: req.userId,
					deleted_at: null
				},
				data: {
					key_name: req.keyName,
					native_language: req.nativeLanguage
				}
			});
			if (!profile?.id) {
				dbError ??= new Error(`Can't find user profile. User ID=${req.userId}`);
				throw dbError;
			}

			await tx.user_profile_languages.deleteMany({
				where: {
					profile_id: profile.id
				}
			});
			await tx.user_profile_languages.createMany({
				data: [
					{
						profile_id: profile.id,
						language_code: req.nativeLanguage,
						pen_name: req.penName,
						headline: req.headline,
						self_introduction: req.selfIntroduction
					}
				]
			});

			return profile;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user profile. User ID=${req.userId}`);
			return undefined;
		});

	return { profile, dbError };
}
