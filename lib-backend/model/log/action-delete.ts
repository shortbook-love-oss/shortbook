import prisma from '$lib-backend/database/connect';

export interface DbLogActionsDeleteRequest {
	actionName: string;
	ipAddressHash: string;
}

export async function dbLogActionDelete(req: DbLogActionsDeleteRequest) {
	let dbError: Error | undefined;

	await prisma.log_actions
		.deleteMany({
			where: {
				action_name: req.actionName,
				ip_address_hash: req.ipAddressHash
			}
		})
		.catch(() => {
			dbError ??= new Error(`Could not connect to database.`);
			return undefined;
		});

	return { dbError };
}
