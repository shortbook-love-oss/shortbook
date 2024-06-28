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
		.catch(() => {
			dbError ??= new Error(`Failed to update user email. User ID=${req.userId}`);
			return undefined;
		});

	return { user, dbError };
}
