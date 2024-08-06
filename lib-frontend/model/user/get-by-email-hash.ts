import prisma from '$lib/prisma/connect';

export interface DbUserGetByEmailHashRequest {
	emailHash: string;
}

export async function dbUserGetByEmailHash(req: DbUserGetByEmailHashRequest) {
	let dbError: Error | undefined;

	const user = await prisma.user
		.findFirst({
			where: {
				email_hash: req.emailHash,
				deleted_at: null
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
			dbError ??= new Error(`Failed to get user.`);
			return undefined;
		});

	return { user, dbError };
}
