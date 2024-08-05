import crypto from 'crypto';
import type { Encrypted } from '$lib/utilities/crypto';

/** Don't call from client-side code */

export function encrypt(originalData: string, password: string, salt: string) {
	const key = crypto.scryptSync(password, salt, 32);
	// IV should change with each run
	const ivBuffer = crypto.randomBytes(16);

	const cipher = crypto.createCipheriv('aes-256-cbc', key, ivBuffer);
	const encryptTarget = cipher.update(originalData);
	const encryptedBuffer = Buffer.concat([encryptTarget, cipher.final()]);

	const encrypted: Encrypted = {
		encryptedData: encryptedBuffer.toString('base64'),
		iv: ivBuffer.toString('base64')
	};
	return encrypted;
}

// "originalData" → "iviviviviviv_encryptedFlatHUYOo0unVR=="
export function encryptAndFlat(originalData: string, password: string, salt: string) {
	const encrypted = encrypt(originalData, password, salt);
	return `${encrypted.iv}_${encrypted.encryptedData};`;
}

export function decrypt(encryptedData: string, iv: string, password: string, salt: string) {
	const encryptedBuffer = Buffer.from(encryptedData, 'base64');
	const ivBuffer = Buffer.from(iv, 'base64');

	const key = crypto.scryptSync(password, salt, 32);
	const decipher = crypto.createDecipheriv('aes-256-cbc', key, ivBuffer);
	const decryptTarget = decipher.update(encryptedBuffer);
	const decryptedData = Buffer.concat([decryptTarget, decipher.final()]);

	return decryptedData.toString('utf8');
}

// "iviviviviviv_encryptedFlatHUYOo0unVR==" → "originalData"
export function decryptFromFlat(encryptedFlat: string, password: string, salt: string) {
	const [iv, encryptedData] = encryptedFlat.split('_');
	return decrypt(encryptedData, iv, password, salt);
}

export function toHash(originalData: string, suffix: string) {
	return crypto
		.createHash('sha512')
		.update(originalData + suffix)
		.digest('base64');
}
