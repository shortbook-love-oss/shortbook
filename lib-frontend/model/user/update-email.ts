import prisma from '$lib/prisma/connect';

export interface DbUserEmailUpdateRequest {
	userId: string;
	email: string;
}

export async function dbUserEmailUpdate(req: DbUserEmailUpdateRequest) {
	let dbError: Error | undefined;

	const user = await prisma.user
		.update({
			where: {
				id: req.userId
			},
			data: {
				email: req.email
			}
		})
		.catch((e: Error) => {
			dbError = e;
			return undefined;
		});

	return { user, dbError };
}
