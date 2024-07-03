import crypto from 'crypto';
import type { Cookies } from '@sveltejs/kit';
import { setOption, keyAuthUserId } from '$lib/utilities/cookie';
import { env } from '$env/dynamic/private';

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

	const encrypted: Encrypted = {
		encryptedData: encryptedBuffer.toString('base64'),
		iv: ivBuffer.toString('base64')
	};
	return encrypted;
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

export function setAuthUserId(cookie: Cookies, value: string) {
	const encryptedValue = encrypt(value, env.ENCRYPT_PASSWORD_USER_ID, env.ENCRYPT_SALT);
	cookie.set(keyAuthUserId, JSON.stringify(encryptedValue), setOption);
}
export function getAuthUserId(cookie: Cookies) {
	const value = cookie.get(keyAuthUserId);
	if (!value) {
		return '';
	}
	const encrypted: Encrypted = JSON.parse(value);
	return decrypt(encrypted.encryptedData, encrypted.iv, env.ENCRYPT_PASSWORD_USER_ID, env.ENCRYPT_SALT);
}
