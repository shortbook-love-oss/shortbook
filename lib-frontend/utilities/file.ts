import type { ActionResult } from '@sveltejs/kit';

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
	'image/tiff': 'tiff',
	'image/bmp': 'bmp',
	'image/vnd.microsoft.icon': 'ico',
	'image/svg+xml': 'svg'
};

export const maybeSvgMIMEs = ['image/svg+xml', 'application/xml', 'text/xml'];
export const maybeIcoMIMEs = ['image/x-icon'];

export function getUnitByteLength(byteLength: number, decimalPoint: number) {
	if (!byteLength || decimalPoint < 0) {
		return 'n/a';
	}

	const sizeUnits = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	let sizeUnitIndex = 0;
	for (let i = sizeUnits.length - 1; i > 0; i--) {
		if (byteLength / 1024 ** i >= 1) {
			sizeUnitIndex = i;
			break;
		}
	}
	const unitAmount = (byteLength / 1024 ** sizeUnitIndex).toFixed(sizeUnitIndex ? decimalPoint : 0);
	const unitAmountFixed = unitAmount.replace(`.${'0'.repeat(decimalPoint)}`, '');

	return `${unitAmountFixed} ${sizeUnits[sizeUnitIndex]}`;
}

export async function uploadFiles(actionUrl: string, files: FileList, uploadProp: string) {
	const body = new FormData();
	for (let i = 0; i < files.length; i++) {
		body.append(uploadProp, files[i]);
	}

	const uploadResult = await fetch(actionUrl, {
		method: 'POST',
		headers: {
			'user-agent': 'ShortBook Paid-Article Writing Platform'
		},
		body
	})
		.then(async (res) => {
			const result = (await res.json()) as ActionResult;
			if (result.type === 'error') {
				if (result.error instanceof Error) {
					return result.error;
				} else if (typeof result.error === 'string') {
					return new Error(result.error);
				} else {
					return new Error(`Failed to upload files ${result.status}`);
				}
			} else if (result.type === 'failure') {
				return new Error(`Failed to upload files ${result.status}`);
			} else {
				return result;
			}
		})
		.catch((error: Error) => error);

	return uploadResult;
}
