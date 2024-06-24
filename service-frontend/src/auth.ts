import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import LinkedIn from '@auth/sveltekit/providers/linkedin';
import GitHub from '@auth/sveltekit/providers/github';
import { dbUserProfileCreate } from '$lib/model/user/profile/create';
import { dbUserEmailUpdate } from '$lib/model/user/update-email';
import prisma from '$lib/prisma/connect';
import {
	AUTH_SECRET,
	AUTH_LINKEDIN_ID,
	AUTH_LINKEDIN_SECRET,
	AUTH_GITHUB_ID,
	AUTH_GITHUB_SECRET
} from '$env/static/private';

export const { handle, signIn, signOut } = SvelteKitAuth({
	trustHost: true,
	adapter: PrismaAdapter(prisma),
	secret: AUTH_SECRET, // Include env to build directory
	providers: [
		LinkedIn({
			clientId: AUTH_LINKEDIN_ID,
			clientSecret: AUTH_LINKEDIN_SECRET
		}),
		GitHub({
			clientId: AUTH_GITHUB_ID,
			clientSecret: AUTH_GITHUB_SECRET
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
		async redirect({ url, baseUrl }) {
			if (url.startsWith(baseUrl) && new URL(url).origin === baseUrl) {
				return Promise.resolve(url);
			} else {
				return Promise.resolve(baseUrl);
			}
		},
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
