import type { Prisma, User } from '@prisma/client';
import prisma from '$lib/prisma/connect';

export interface DbUserProvideDataRequest {
	userId: string;
	email: string;
	emailVerified: boolean;
	isIncludeDelete?: boolean;
}

export async function dbUserProvideDataUpdate(req: DbUserProvideDataRequest) {
	let dbError: Error | undefined;

	const whereByCond: Partial<Prisma.UserWhereUniqueInput> = {};
	if (!req.isIncludeDelete) {
		whereByCond.deleted_at = null;
	}
	const saveByCond: Partial<User> = {};
	if (req.emailVerified) {
		saveByCond.emailVerified = new Date();
	}

	const user = await prisma.user
		.update({
			where: {
				id: req.userId,
				...whereByCond
			},
			data: {
				email: req.email,
				...saveByCond
			}
		})
		.then((user) => {
			if (!user) {
				dbError ??= new Error(`Can't find user. User ID=${req.userId}`);
				return undefined;
			}
			return user;
		})
		.catch(() => {
			dbError ??= new Error(`Failed to update user email. User ID=${req.userId}`);
			return undefined;
		});

	return { user, dbError };
}
