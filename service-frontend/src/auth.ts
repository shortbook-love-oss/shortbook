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
	callbacks: {
		async session({ session, user }: any) {
			// Filter only using properties
			session = {};
			// Send properties to the client, like an access_token and user id from a provider
			session.id = user.id;
			session.email = user.email;
			session.name = user.name;
			session.image = user.image;
			return session;
		}
	}
});
