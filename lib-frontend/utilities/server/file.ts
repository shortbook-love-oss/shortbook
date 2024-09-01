import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

export async function uploadFile(
	file: Blob | Buffer | Uint8Array,
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
