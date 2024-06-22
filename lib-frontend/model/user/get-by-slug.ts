import prisma from '$lib/prisma/connect';

export interface DbUserGetBySlugRequest {
	slug: string;
}

export async function dbUserGetBySlug(req: DbUserGetBySlugRequest) {
	let dbError: Error | undefined;

	const user = await prisma.user
		.findFirst({
			where: {
				profiles: {
					slug: req.slug
				}
			}
		})
		.catch((e: Error) => {
			dbError = e;
			return undefined;
		});

	return { user, dbError };
}
