import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from '@auth/sveltekit/providers/google';
import LinkedIn from '@auth/sveltekit/providers/linkedin';
import GitHub from '@auth/sveltekit/providers/github';
import { env } from '$env/dynamic/private';
import { dbUserProfileCreate } from '$lib/model/user/profile/create';
import { dbUserProfileImageUpdate } from '$lib/model/user/update-profile-image';
import { dbUserProvideDataUpdate } from '$lib/model/user/update-provide-data';
import prisma from '$lib/prisma/connect';
import { sendEmail } from '$lib/utilities/server/email';
import { fileUpload } from '$lib/utilities/server/file';

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

			// Upload profile image using in external service CDN
			if (user.id && user.image?.startsWith('https://')) {
				// 1. Fetch from external service CDN
				const blob = await fetch(user.image, { mode: 'no-cors' })
					.then((res) => res.blob())
					.then((blob) => blob)
					.catch(() => undefined);

				if (blob) {
					// 2. Upload image to Amazon S3
					const isSuccessUpload = await fileUpload(
						env.AWS_BUCKET_PROFILE_IMAGE,
						`${user.id}/original`,
						blob
					);
					if (isSuccessUpload) {
						// 3. Save image URL to DB
						await dbUserProfileImageUpdate({
							userId: user.id,
							image: `https://${env.AWS_BUCKET_PROFILE_IMAGE}.s3.${env.AWS_REGION}.amazonaws.com/${user.id}/original`
						});
					}
				}
			}

			if (user.email) {
				// 4. Send welcome email
				try {
					await sendEmail(
						env.EMAIL_FROM,
						[user.email],
						'Welcome to ShortBook.',
						'<p>Enjoy your writing journey!</p><p>Sincerely thank.</p><p>ShortBook LLC</p><p>Shunsuke Kurachi (KurachiWeb)</p>',
						'Enjoy your writing journey!\nSincerely thank.\n\nShortBook LLC\nShunsuke Kurachi (KurachiWeb)'
					);
				} catch (e) {
					console.log(e);
				}
			}
		},
		async signIn({ user, profile }) {
			if (user.id && profile?.email) {
				// Sync with email address registered in external service
				await dbUserProvideDataUpdate({
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
