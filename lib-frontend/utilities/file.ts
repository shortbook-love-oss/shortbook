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

export const maybeSvgMIMEs = ['image/svg+xml', 'application/xml', 'text/xml'];
