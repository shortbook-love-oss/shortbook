import prisma from '$lib/prisma/connect';

export interface DbUserUpdateRequest {
	userId: string;
	keyName: string;
	nativeLanguage: string;
	penName: string;
	headline: string;
	selfIntroduction: string;
}

export async function dbUserProfileUpdate(req: DbUserUpdateRequest) {
	let dbError: Error | undefined;

	const profile = await prisma
		.$transaction(async (tx) => {
			const profile = await tx.user_profiles.update({
				where: {
					user_id: req.userId
				},
				data: {
					key_name: req.keyName,
					native_language: req.nativeLanguage
				}
			});
			await tx.user_profile_languages.deleteMany({
				where: {
					profile_id: profile.id
				}
			});
			if (!profile?.id) {
				throw new Error(`Can't find profile of userId=${req.userId}.`);
			}

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
		.catch((e: Error) => {
			dbError = e;
			return undefined;
		});

	return { profile, dbError };
}
