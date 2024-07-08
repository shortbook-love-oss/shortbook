import { Storage } from '@google-cloud/storage';
import type { GetSignedUrlConfig } from '@google-cloud/storage';
import { env } from '$env/dynamic/private';

export async function getGcsSignedUrl(
	bucketName: string,
	fileName: string,
	contentType: string,
	expireSeconds: number
) {
	const storage = new Storage({
		projectId: env.GCP_PROJECT_ID,
		keyFilename: 'lib/private/service-account.json'
	});

	const options: GetSignedUrlConfig = {
		version: 'v4',
		action: 'write',
		contentType,
		expires: Date.now() + expireSeconds * 1000
	};
	const [url] = await storage.bucket(bucketName).file(fileName).getSignedUrl(options);

	return url;
}

export async function uploadGcsBySignedUrl(file: Blob, signedUrl: string) {
	return await fetch(signedUrl, {
		method: 'PUT',
		body: file,
		headers: {
			'Cache-Control': 'public, max-age=20'
		}
	});
}
