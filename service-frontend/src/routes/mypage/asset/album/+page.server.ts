import { fail, error } from '@sveltejs/kit';
import { superValidate, message } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import { env as envPublic } from '$env/dynamic/public';
import type { AlbumImageEditItem } from '$lib/utilities/album';
import { getRandom } from '$lib/utilities/crypto';
import { imageMIMEextension } from '$lib/utilities/file';
import type { AvailableLanguageTags } from '$lib/utilities/language';
import { schema } from '$lib/validation/schema/user/album/image-create';
import { schema as schemaEdit } from '$lib/validation/schema/user/album/image-update';
import { uploadToAlbum } from '$lib-backend/functions/service/album/upload';
import { dbUserAlbumImageList } from '$lib-backend/model/user/album/image-list';
import { getExtensionForAll } from '$lib-backend/utilities/infrastructure/image';

export const load = async ({ locals }) => {
	const signInUser = locals.signInUser;
	if (!signInUser) {
		return error(401, { message: 'Unauthorized' });
	}

	const form = await superValidate(zod(schema));

	const { albumImages, dbError } = await dbUserAlbumImageList({
		userId: signInUser.id
	});
	if (!albumImages || dbError) {
		return error(500, { message: dbError?.message ?? '' });
	}

	const albumImageList = await Promise.all<AlbumImageEditItem>(
		albumImages.map(async (image) => {
			const editForm = await superValidate(zod(schemaEdit), { id: getRandom(15) });
			editForm.data.name = image.name;
			editForm.data.alt = image.alt;
			editForm.data.languageInImage = image.language_in_image as AvailableLanguageTags | '';
			editForm.data.place = image.place;
			editForm.data.copyrightOwner = image.license?.copyright_owner ?? '';
			editForm.data.targetInImage = image.license?.target_in_image ?? '';
			editForm.data.licenseUrl = image.license?.license_url ?? '';
			editForm.data.isSensitive = image.is_sensitive;
			editForm.data.isAi = image.is_ai;
			const fromExtension = imageMIMEextension[image.property?.mime_type ?? ''] ?? '';

			return {
				editForm,
				id: image.id,
				userId: signInUser.id,
				name: image.name,
				alt: image.alt,
				languageInImage: image.language_in_image as AvailableLanguageTags | '',
				filePath: `${envPublic.PUBLIC_ORIGIN_IMAGE_CDN}/user-album/${signInUser.id}/${image.property?.file_path}`,
				byteLength: image.property?.byte_length ?? 0,
				width: image.property?.width ?? 0,
				height: image.property?.height ?? 0,
				toExtension: getExtensionForAll(fromExtension)
			};
		})
	);

	return { form, albumImageList };
};

export const actions = {
	default: async ({ request, locals }) => {
		const signInUser = locals.signInUser;
		if (!signInUser) {
			return error(401, { message: 'Unauthorized' });
		}

		const form = await superValidate(request, zod(schema));
		if (!form.valid) {
			message(form, 'There was an error. please check your selected image and resubmit.');
			return fail(400, { form });
		}

		const { errorMessage } = await uploadToAlbum(form.data.images, signInUser.id);
		if (errorMessage) {
			return error(500, { message: errorMessage });
		}

		return message(form, 'Image uploaded successfully.');
	}
};
