import prisma from '$lib/prisma/connect';

export interface DbLogActionCreateRequest {
	actionName: string;
	ipAddressHash: string;
}

export async function dbLogActionCreate(req: DbLogActionCreateRequest) {
	let dbError: Error | undefined;

	const logActions = await prisma.log_actions
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

	return { logActions, dbError };
}
