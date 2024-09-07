import prisma from '$lib-backend/database/connect';

export interface DbUserGetByKeyNameRequest {
	keyName: string;
}

export async function dbUserGetByKeyName(req: DbUserGetByKeyNameRequest) {
	let dbError: Error | undefined;

	const user = await prisma.user
		.findFirst({
			where: {
				deleted_at: null,
				profiles: {
					key_name: req.keyName,
					deleted_at: null
				}
			},
			include: {
				profiles: {
					where: {
						deleted_at: null
					},
					include: {
						languages: {
							where: {
								deleted_at: null
							}
						}
					}
				}
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user. Display user ID=${req.keyName}`);
			return undefined;
		});

	return { user, dbError };
}
