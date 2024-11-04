export const maxUploadSize = 1024 ** 2 * 28;

export function isValidFilesSize(files: FileList | File[]) {
	let fileSize = 0;
	for (const file of files) {
		fileSize += file.size;
	}
	return fileSize <= maxUploadSize;
}
