import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from '@auth/sveltekit/providers/google';
import LinkedIn from '@auth/sveltekit/providers/linkedin';
import GitHub from '@auth/sveltekit/providers/github';
import { dbUserProfileCreate } from '$lib/model/user/profile/create';
import { dbUserProvideDataUpdate } from '$lib/model/user/update-provide-data';
import prisma from '$lib/prisma/connect';
import { env } from '$env/dynamic/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
	secret: env.AUTH_SECRET,
	trustHost: true,
	adapter: PrismaAdapter(prisma),
	providers: [
		Google({
			clientId: env.AUTH_GOOGLE_ID,
			clientSecret: env.AUTH_GOOGLE_SECRET
		}),
		LinkedIn({
			clientId: env.AUTH_LINKEDIN_ID,
			clientSecret: env.AUTH_LINKEDIN_SECRET
		}),
		GitHub({
			clientId: env.AUTH_GITHUB_ID,
			clientSecret: env.AUTH_GITHUB_SECRET
		})
	],
	pages: {
		signIn: '/signin',
		newUser: '/signup'
	},
	events: {
		async createUser({ user }) {
			// Create initialized user profile
			await dbUserProfileCreate({
				userId: user.id as string,
				keyName: crypto.randomUUID().replaceAll('-', '').slice(0, 16),
				penName: user.name as string
			});
		},
		async signIn({ user, profile }) {
			if (user.id && profile?.email && typeof profile?.picture === 'string') {
				// Sync with email address registered in external service
				await dbUserProvideDataUpdate({
					userId: user.id,
					email: profile.email,
					image: profile.picture
				});
			}
		}
	},
	callbacks: {
		async session({ session, user }: any) {
			// Send properties to the client, like an access_token and user id from a provider.
			// Filter only using properties.
			session = {
				expires: session.expires,
				user: {
					id: user.id,
					name: user.name,
					image: user.image
				}
			};
			return Promise.resolve(session);
		}
	}
});
