import prisma from '$lib-backend/database/connect';

export interface DbLogActionsCreateRequest {
	actionName: string;
	ipAddressHash: string;
}

export async function dbLogActionCreate(req: DbLogActionsCreateRequest) {
	let dbError: Error | undefined;

	const logAction = await prisma.log_actions
		.create({
			data: {
				action_name: req.actionName,
				ip_address_hash: req.ipAddressHash
			}
		})
		.catch(() => {
			dbError ??= new Error(`Could not connect to database.`);
			return undefined;
		});

	return { logAction, dbError };
}
