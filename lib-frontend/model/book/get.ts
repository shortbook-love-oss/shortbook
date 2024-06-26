import prisma from '$lib/prisma/connect';

export interface DbBookGetRequest {
	bookId: string;
}

export async function dbBookGet(req: DbBookGetRequest) {
	let dbError: Error | undefined;

	const book = await prisma.books
		.findUnique({
			where: {
				id: req.bookId
			},
			include: {
				languages: true,
				tags: true
			}
		})
		.catch((e: Error) => {
			dbError = e;
			return undefined;
		});

	return { book, dbError };
}
