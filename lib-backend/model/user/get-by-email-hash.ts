import prisma from '$lib-backend/database/connect';

export interface DbUserGetByEmailHashRequest {
	emailHash: string;
	isIncludeDelete?: boolean;
}

export async function dbUserGetByEmailHash(req: DbUserGetByEmailHashRequest) {
	let dbError: Error | undefined;

	const whereCondDelete: { deleted_at?: null } = {};
	if (!req.isIncludeDelete) {
		whereCondDelete.deleted_at = null;
	}

	const user = await prisma.users
		.findFirst({
			where: {
				email_hash: req.emailHash,
				...whereCondDelete
			},
			include: {
				languages: {
					where: { ...whereCondDelete }
				}
			}
		})
		.catch(() => {
			dbError ??= new Error(`Failed to get user.`);
			return undefined;
		});

	return { user, dbError };
}
