export type Encrypted = {
	encryptedData: string;
	iv: string;
};

// e.g. "zjmt1a15ezf975xyc091ykird5"
export function getRandom(outputLength: number) {
	const splitLength = 5;
	const arraySize = Math.ceil(outputLength / splitLength);
	const randoms = [...crypto.getRandomValues(new Uint32Array(arraySize))].map((v) =>
		v.toString(36).slice(-splitLength)
	);
	return randoms.join('').slice(0, outputLength);
}
