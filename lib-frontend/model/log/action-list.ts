import prisma from '$lib/prisma/connect';

export interface DbLogActionsListRequest {
	actionName: string;
	ipAddressHash: string;
	dateFrom: Date;
}

export async function dbLogActionList(req: DbLogActionsListRequest) {
	let dbError: Error | undefined;

	const logActions = await prisma.log_actions
		.findMany({
			where: {
				action_name: req.actionName,
				ip_address_hash: req.ipAddressHash,
				created_at: { gte: req.dateFrom },
				deleted_at: null
			}
		})
		.catch(() => {
			dbError ??= new Error(`Could not connect to database.`);
			return undefined;
		});

	return { logActions, dbError };
}
