import prisma from '$lib-backend/database/connect';

export interface DbUserSessionDeleteRequest {
	sessionToken: string;
}

export async function dbUserSessionDelete(req: DbUserSessionDeleteRequest) {
	let dbError: Error | undefined;

	await prisma.sessions
		.delete({
			where: {
				session_token: req.sessionToken
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to delete user session.`);
			return undefined;
		});

	return { dbError };
}
