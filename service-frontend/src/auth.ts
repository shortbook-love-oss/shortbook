import { PrismaAdapter } from '@auth/prisma-adapter';
import { SvelteKitAuth, type Session } from '@auth/sveltekit';
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';
import prisma from '$lib-backend/database/connect';

export const { handle, signIn, signOut } = SvelteKitAuth({
	secret: env.AUTH_SECRET,
	trustHost: true,
	adapter: PrismaAdapter(prisma),
	providers: [],
	pages: {
		signIn: '/signin',
		newUser: '/signup'
	},
	callbacks: {
		async session({ session, user }) {
			// Send properties to the client, like an access_token and user id from a provider.
			// Filter only using properties.
			const customSession: Session = {
				expires: session.expires,
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image ? envPublic.PUBLIC_ORIGIN_IMAGE_CDN + user.image : ''
				}
			};
			return Promise.resolve(customSession);
		}
	}
});
