import prisma from '$lib/prisma/connect';

export interface DbUserGetByKeyNameRequest {
	keyName: string;
}

export async function dbUserGetByKeyName(req: DbUserGetByKeyNameRequest) {
	let dbError: Error | undefined;

	const user = await prisma.user
		.findFirst({
			where: {
				profiles: {
					key_name: req.keyName
				}
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user. Display user ID=${req.keyName}`);
			return undefined;
		});

	return { user, dbError };
}
