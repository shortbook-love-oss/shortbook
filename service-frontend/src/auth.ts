import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import LinkedIn from '@auth/sveltekit/providers/linkedin';
import GitHub from '@auth/sveltekit/providers/github';
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
			await prisma.user_profiles.create({
				data: {
					user_id: user.id as string,
					slug: crypto.randomUUID().replaceAll('-', '').slice(0, 16),
					native_lang: '',
					location: '',
					langs: {
						create: {
							lang_tag: '',
							pen_name: user.name ?? '',
							headline: '',
							self_intro: ''
						}
					}
				}
			});
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
					email: user.email,
					name: user.name,
					image: user.image
				}
			};
			return Promise.resolve(session);
		}
	}
});
