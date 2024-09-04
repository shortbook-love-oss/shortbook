import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

export interface StorageBucket {
	storageBucketName: string;
	storageCdnBucketName: string;
}

export async function getFile(region: string, bucketName: string, filePath: string) {
	const s3 = new S3Client({
		region,
		forcePathStyle: true,
		maxAttempts: 2,
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY
		}
	});

	let file: Uint8Array | undefined;
	let contentType = '';
	let error: Error | undefined;

	const command = new GetObjectCommand({
		Bucket: bucketName,
		Key: filePath
	});
	await s3
		.send(command)
		.then(async (response) => {
			file = await response.Body?.transformToByteArray();
			contentType = response.ContentType ?? '';
		})
		.catch((e: Error) => {
			error = e;
		});

	return { file, contentType, error };
}

export async function uploadFile(
	file: Uint8Array,
	contentType: string,
	region: string,
	bucketName: string,
	filePath: string,
	cacheControl: string | undefined
) {
	const s3 = new S3Client({
		region,
		forcePathStyle: true,
		maxAttempts: 2,
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY
		}
	});

	let isSuccessUpload = false;
	let error;

	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: filePath,
		Body: file,
		ContentType: contentType,
		ChecksumAlgorithm: 'SHA256',
		CacheControl: cacheControl // e.g. "max-age=86400"
	});
	await s3
		.send(command)
		.then((uploadResult) => {
			isSuccessUpload = uploadResult.$metadata.httpStatusCode === 200;
		})
		.catch((e: Error) => {
			error = e;
		});

	return { isSuccessUpload, error };
}
