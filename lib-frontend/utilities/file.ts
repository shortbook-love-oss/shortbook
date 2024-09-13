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
