import prisma from '$lib/prisma/connect';
import { getSessionToken, getUserId } from '$lib/utilities/cookie';
import { getLangTag } from '$lib/utilities/url';

const brandNames = {
	linkedin: 'LinkedIn',
	github: 'GitHub'
};

export const load = async ({ url, cookies }) => {
	const sessionToken = getSessionToken(cookies);
	const langTag = getLangTag(url.pathname) || 'en';

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
