import { PrismaAdapter } from '@auth/prisma-adapter';
import {
	SvelteKitAuth,
	type Account,
	type Profile,
	type Session,
	type User
} from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import LinkedIn from '@auth/sveltekit/providers/linkedin';
import GitHub from '@auth/sveltekit/providers/github';
import { env } from '$env/dynamic/private';
import { env as envPublic } from '$env/dynamic/public';
import { dbUserProfileCreate } from '$lib/model/user/profile/create';
import { dbUserRestore } from '$lib/model/user/restore';
import { dbUserProfileImageUpdate } from '$lib/model/user/update-profile-image';
import { dbUserProvideDataUpdate } from '$lib/model/user/update-provide-data';
import prisma from '$lib/prisma/connect';
import { encryptAndFlat } from '$lib/utilities/server/crypto';
import { sendEmail, toHashUserEmail } from '$lib/utilities/server/email';
import { uploadFile } from '$lib/utilities/server/file';
import { imageMIMEextension } from '$lib/utilities/file';
import { matchSigninProvider } from '$lib/utilities/signin';

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
		async signIn({ user, profile, account, isNewUser }) {
			if (isNewUser) {
				await onSignedUp(user, profile, account);
			} else {
				await onSignedIn(user, profile, account);
			}
		}
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

async function onSignedUp(user: User, profile: Profile | undefined, account: Account | null) {
	const providerName = account?.provider.toLowerCase() ?? '';
	let penName = user.name ?? '';
	let selfIntroduction = '';
	let emailVerified = false;
	if (matchSigninProvider(providerName)) {
		if (profile?.name) {
			penName = profile.name;
		}
		emailVerified = !!profile?.email_verified;
	}
	if (providerName === 'github') {
		if (typeof profile?.bio === 'string') {
			selfIntroduction = profile.bio;
		}
		// @todo save "twitter_username" and "twitter_username" to user_urls table
	}

	if (user.id && user.email) {
		const emailEncrypt = encryptAndFlat(user.email, env.ENCRYPT_EMAIL_USER, env.ENCRYPT_SALT);
		const emailHash = toHashUserEmail(user.email, providerName);
		// By default, AuthJS save plain email
		// But we think it should be encrypt
		await dbUserProvideDataUpdate({
			userId: user.id,
			emailEncrypt,
			emailHash,
			emailVerified
		});
	}

	// Create initialized user profile
	await dbUserProfileCreate({
		userId: user.id as string,
		keyName: crypto.randomUUID().replaceAll('-', '').slice(0, 16),
		penName,
		selfIntroduction
	});

	// Upload profile image using in external service CDN
	if (user.id && user.image?.startsWith('https://')) {
		// 1. Fetch from external service CDN
		const blob = await fetch(user.image, { mode: 'no-cors' })
			.then((res) => res.blob())
			.then((blob) => blob)
			.catch(() => undefined);

		if (blob) {
			const cacheRefresh = Date.now().toString(36);
			const extension = imageMIMEextension[blob.type as keyof typeof imageMIMEextension];
			// 2. Upload image to Amazon S3
			const savePath = `${user.id}/profile-image-${cacheRefresh}.${extension}`;
			const { isSuccessUpload } = await uploadFile(
				blob,
				blob.type,
				env.AWS_REGION,
				env.AWS_BUCKET_IMAGE_PROFILE,
				savePath,
				undefined
			);
			if (isSuccessUpload) {
				// 3. Save image URL to DB
				await dbUserProfileImageUpdate({
					userId: user.id,
					image: '/profile/' + savePath
				});
			}
		}
	}

	if (user.email) {
		// 4. Send welcome email
		await sendEmail(
			'ShortBook Service',
			env.EMAIL_FROM,
			[user.email],
			'Welcome to ShortBook.',
			'<p>Enjoy your writing journey!</p><p>Sincerely thank.</p><p>ShortBook LLC</p><p>Shunsuke Kurachi (KurachiWeb)</p>',
			'Enjoy your writing journey!\nSincerely thank.\n\nShortBook LLC\nShunsuke Kurachi (KurachiWeb)'
		);
	}
}

async function onSignedIn(user: User, profile: Profile | undefined, account: Account | null) {
	const providerName = account?.provider.toLowerCase() ?? '';
	let emailVerified = false;
	if (matchSigninProvider(providerName)) {
		emailVerified = !!profile?.email_verified;
	}

	if (user.id && profile?.email) {
		// Sync with email address registered in external service
		const emailEncrypt = encryptAndFlat(profile.email, env.ENCRYPT_EMAIL_USER, env.ENCRYPT_SALT);
		const emailHash = toHashUserEmail(profile.email, providerName);
		const { user: savedUser } = await dbUserProvideDataUpdate({
			userId: user.id,
			emailEncrypt,
			emailHash,
			emailVerified,
			isIncludeDelete: true
		});

		// Restore user if soft deleted
		if (savedUser?.deleted_at) {
			await dbUserRestore({ userId: user.id });
		}
	}
}
