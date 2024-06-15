import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import LinkedIn from '@auth/sveltekit/providers/linkedin';
import GitHub from '@auth/sveltekit/providers/github';

const prisma = new PrismaClient();

export const { handle, signIn, signOut } = SvelteKitAuth({
	trustHost: true,
	adapter: PrismaAdapter(prisma),
	secret: process.env.AUTH_SECRET, // Include env to build directory
	providers: [LinkedIn, GitHub],
	events: {
		async signIn({ user }) {
			// Create initialized user profile
			// Does not retain location
			await prisma.user_profiles.create({
				data: {
					user_id: user.id as string,
					slug: crypto.randomUUID().replaceAll('-', '').slice(0, 16)
				}
			});
		}
	},
	callbacks: {
		session({ session, user }: any) {
			// Send properties to the client, like an access_token and user id from a provider
			// Filter only using properties
			session = {
				expires: session.expires,
				user: {
					id: user.id,
					email: user.email,
					name: user.name,
					image: user.image
				}
			};
			return session;
		}
	}
});
