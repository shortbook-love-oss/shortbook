import prisma from '$lib/prisma/connect';

export interface DbUserUpdateRequest {
	userId: string;
	slug: string;
	nativeLang: string;
	penName: string;
	headline: string;
	selfIntro: string;
}

export async function dbUserProfileUpdate(req: DbUserUpdateRequest) {
	let error: Error | undefined;

	const profile = await prisma
		.$transaction(async (tx) => {
			const profile = await tx.user_profiles.update({
				where: {
					user_id: req.userId
				},
				data: {
					slug: req.slug,
					native_lang: req.nativeLang
				}
			});
			await tx.user_profile_langs.deleteMany({
				where: {
					profile_id: profile.id
				}
			});
			if (!profile?.id) {
				throw new Error(`Can't find profile of userId=${req.userId}.`);
			}

			await tx.user_profile_langs.createMany({
				data: [
					{
						profile_id: profile.id,
						lang_tag: req.nativeLang,
						pen_name: req.penName,
						headline: req.headline,
						self_intro: req.selfIntro
					}
				]
			});

			return profile;
		})
		.catch((e: Error) => {
			error = e;
			return undefined;
		});

	return { profile, error };
}
