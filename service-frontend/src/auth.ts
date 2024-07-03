import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import LinkedIn from '@auth/sveltekit/providers/linkedin';
import GitHub from '@auth/sveltekit/providers/github';
import { dbUserProfileCreate } from '$lib/model/user/profile/create';
import { dbUserEmailUpdate } from '$lib/model/user/update-email';
import prisma from '$lib/prisma/connect';

export const { handle, signIn, signOut } = SvelteKitAuth({
	trustHost: true,
	adapter: PrismaAdapter(prisma),
	providers: [LinkedIn, GitHub],
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
			if (user.id && profile?.email) {
				// Sync with email address registered in external service
				await dbUserEmailUpdate({
					userId: user.id,
					email: profile.email
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
