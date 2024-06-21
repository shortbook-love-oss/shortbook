import prisma from '$lib/prisma/connect';
import { getSessionToken, getUserId } from '$lib/utilities/cookie';
import { guessNativeLangFromRequest } from '$lib/utilities/language';

const brandNames = {
	linkedin: 'LinkedIn',
	github: 'GitHub'
};

export const load = async ({ request, cookies }) => {
	const sessionToken = getSessionToken(cookies);
	const langTag = guessNativeLangFromRequest(request);

	const user = await prisma.user.findUnique({
		where: { id: getUserId(cookies) },
		include: {
			accounts: true,
			sessions: {
				where: { sessionToken: sessionToken },
				take: 1
			}
		}
	});

	const providerNameLowercase = (user?.accounts[0].provider ?? '') as keyof typeof brandNames;
	const providerName = brandNames[providerNameLowercase] ?? '';
	const userCreatedAt = user?.created_at?.toLocaleString(langTag) ?? '';
	const lastSignedAt = user?.sessions[0]?.created_at?.toLocaleString(langTag) ?? '';

	return { providerName, userCreatedAt, lastSignedAt };
};
