import { PrismaClient } from '@prisma/client';

const charset = process.argv[2];
const collection = process.argv[3];

const dbName = 'shortbook';
const prisma = new PrismaClient({
	datasourceUrl: process.env.DATABASE_URL
});

(async () => {
	const tables = await prisma.$queryRaw`show tables`;
	if (!Array.isArray(tables)) return;

	for (const table of tables) {
		const tableName = String(table[`Tables_in_${dbName}`]);
		// Excluding Prisma-generated table.
		if (tableName.startsWith('_')) continue;

		await prisma.$queryRawUnsafe(
			`ALTER TABLE ${tableName} DEFAULT CHARSET ${charset} COLLATE ${collection}`
		);
	}
})();
