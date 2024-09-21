import prisma from '$lib-backend/database/connect';

export interface DbUserGetByKeyHandleRequest {
	keyHandle: string;
}

export async function dbUserGetByKeyHandle(req: DbUserGetByKeyHandleRequest) {
	let dbError: Error | undefined;

	const user = await prisma.users
		.findFirst({
			where: {
				key_handle: req.keyHandle,
				deleted_at: null
			},
			include: {
				languages: {
					where: {
						deleted_at: null
					}
				}
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user. User handle=${req.keyHandle}`);
			return undefined;
		});

	return { user, dbError };
}
