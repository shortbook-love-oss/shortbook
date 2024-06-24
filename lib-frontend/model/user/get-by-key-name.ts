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
		.catch((e: Error) => {
			dbError = e;
			return undefined;
		});

	return { user, dbError };
}
