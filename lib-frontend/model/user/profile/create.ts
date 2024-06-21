import prisma from '$lib/prisma/connect';

export interface DbUserCreateRequest {
	userId: string;
	slug: string;
	penName: string;
}

export async function dbUserProfileCreate(req: DbUserCreateRequest) {
	let error: Error | undefined;

	const user = await prisma.user_profiles
		.create({
			data: {
				user_id: req.userId,
				slug: req.slug,
				native_lang: '',
				location: '',
				langs: {
					create: {
						lang_tag: '',
						pen_name: req.penName,
						headline: '',
						self_intro: ''
					}
				}
			}
		})
		.catch((e: Error) => {
			error = e;
			return undefined;
		});

	return { user, error };
}
