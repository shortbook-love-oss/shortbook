export interface FileInputErrorMessages {
	[key: number]: string[] | undefined;
	_errors?: undefined;
}

export interface SelectedFile {
	file: File;
	dataUrl: string;
	key: number;
}

export const imageMIMEextension: Record<string, string> = {
	'image/png': 'png',
	'image/jpeg': 'jpg',
	'image/gif': 'gif',
	'image/apng': 'png',
	'image/webp': 'webp',
	'image/avif': 'avif', // Safari support from v16
	'image/heic': 'heic',
	'image/heif': 'heif',
	'image/tiff': 'tiff',
	'image/bmp': 'bmp',
	'image/x-icon': 'ico',
	'image/svg+xml': 'svg'
};

export function getMIMEType(extension: string) {
	for (const allowType in imageMIMEextension) {
		if (imageMIMEextension[allowType] === extension) {
			return allowType;
		}
	}
	return undefined;
}

// Guess MIME-type of profile image by path
export function guessImageTypeByUrl(imageUrl: string) {
	const extension = imageUrl.match(/\w+$/)?.[0];
	if (extension != null) {
		return getMIMEType(extension);
	}
	return '';
}
