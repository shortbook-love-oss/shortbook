export interface FileInputErrorMessages {
	[key: number]: string[] | undefined;
	_errors?: undefined;
}

export interface SelectedFile {
	file: File;
	dataUrl: string;
	key: number;
}

export const imageMIMEs = [
	'image/png',
	'image/jpeg',
	'image/gif',
	'image/bmp',
	'image/apng',
	'image/webp',
	'image/avif', // Safari support from v16
	'image/heif', // Only support Safari
	'image/heic' // Only support Safari
];
