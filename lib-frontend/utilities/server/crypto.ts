import crypto from 'crypto';
import type { Cookies } from '@sveltejs/kit';
import { setOption, keyAuthUserId } from '$lib/utilities/cookie';
import { ENCRYPT_PASSWORD_USER_ID, ENCRYPT_SALT } from '$env/static/private';

/** Don't call from client-side code */

export type Encrypted = {
	encryptedData: string;
	iv: string;
};

export function encrypt(originalData: string, password: string, salt: string) {
	const key = crypto.scryptSync(password, salt, 32);
	// IV should change with each run
	const ivBuffer = crypto.randomBytes(16);

	const cipher = crypto.createCipheriv('aes-256-cbc', key, ivBuffer);
	const encryptTarget = cipher.update(originalData);
	const encryptedBuffer = Buffer.concat([encryptTarget, cipher.final()]);

	return {
		encryptedData: encryptedBuffer.toString('base64'),
		iv: ivBuffer.toString('base64')
	};
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

export function setAuthUserId(cookie: Cookies, encryptedValue: Encrypted) {
	cookie.set(keyAuthUserId, JSON.stringify(encryptedValue), setOption);
}

export function getAuthUserId(cookie: Cookies) {
	const value = cookie.get(keyAuthUserId);
	if (!value) {
		return '';
	}
	const encrypted: Encrypted = JSON.parse(value);
	return decrypt(encrypted.encryptedData, encrypted.iv, ENCRYPT_PASSWORD_USER_ID, ENCRYPT_SALT);
}
