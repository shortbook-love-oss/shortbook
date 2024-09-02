import type { Prisma } from '@prisma/client';
import prisma from '$lib-backend/database/connect';

export interface DbUserProvideDataRequest {
	userId: string;
	emailEncrypt: string;
	emailHash: string;
	emailVerified: boolean;
	isIncludeDelete?: boolean;
}

export async function dbUserProvideDataUpdate(req: DbUserProvideDataRequest) {
	let dbError: Error | undefined;

	const whereByCond: Prisma.UserWhereUniqueInput = {
		id: req.userId
	};
	if (!req.isIncludeDelete) {
		whereByCond.deleted_at = null;
	}
	const saveByCond: Prisma.UserUpdateInput = {
		email: req.emailEncrypt,
		email_hash: req.emailHash
	};
	if (req.emailVerified) {
		saveByCond.emailVerified = new Date();
	}

	const user = await prisma.user
		.update({
			where: whereByCond,
			data: saveByCond
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
