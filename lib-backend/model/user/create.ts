import prisma from '$lib-backend/database/connect';
import type { CurrencySupportCodes } from '$lib/utilities/currency';
import type { AvailableLanguageTags } from '$lib/utilities/language';

export interface DbUserCreateRequest {
	keyHandle: string;
	penName: string;
	emailEncrypt: string;
	emailHash: string;
	imageSrc: string;
	nativeLanguage: AvailableLanguageTags;
	currency: CurrencySupportCodes;
}

export async function dbUserCreate(req: DbUserCreateRequest) {
	let dbError: Error | undefined;

	const user = await prisma.users
		.create({
			data: {
				key_handle: req.keyHandle,
				pen_name: req.penName,
				email: req.emailEncrypt,
				email_hash: req.emailHash,
				image_src: req.imageSrc,
				native_language: req.nativeLanguage,
				languages: {
					create: {
						target_language: '',
						headline: '',
						self_introduction: ''
					}
				},
				payment_setting: {
					create: {
						currency: req.currency
					}
				}
			}
		})
		.catch(() => {
			dbError ??= new Error(
				`Failed to create user. User handle=${req.keyHandle}, Pen name=${req.penName}`
			);
			return undefined;
		});

	return { user, dbError };
}
