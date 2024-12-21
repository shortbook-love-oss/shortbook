import {
	CopyObjectCommand,
	DeleteObjectsCommand,
	GetObjectCommand,
	ListObjectsV2Command,
	PutObjectCommand,
	S3Client
} from '@aws-sdk/client-s3';
import { env } from '$env/dynamic/private';

export interface StorageBucket {
	storageBucketName: string;
	storageCdnBucketName: string;
}

function createStorageClient(region: string) {
	return new S3Client({
		region,
		forcePathStyle: true,
		maxAttempts: 2,
		credentials: {
			accessKeyId: env.AWS_ACCESS_KEY_ID,
			secretAccessKey: env.AWS_SECRET_ACCESS_KEY
		}
	});
}

export async function getFile(region: string, bucketName: string, filePath: string) {
	const s3 = createStorageClient(region);

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

export async function copyFile(
	region: string,
	bucketName: string,
	filePathFrom: string,
	filePathTo: string
) {
	const s3 = createStorageClient(region);

	const command = new CopyObjectCommand({
		Bucket: bucketName,
		CopySource: `${bucketName}/${filePathFrom}`,
		Key: filePathTo
	});
	return await s3
		.send(command)
		.then((response) => {
			const resCode = response.$metadata.httpStatusCode;
			const isSuccessCopy = resCode != undefined && 200 <= resCode && resCode < 300;
			return { isSuccessCopy, error: undefined };
		})
		.catch((error: Error) => {
			console.error(error);
			return { isSuccessCopy: false, error };
		});
}

export async function uploadFile(
	file: Uint8Array,
	contentType: string,
	region: string,
	bucketName: string,
	filePath: string
) {
	const s3 = createStorageClient(region);

	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: filePath,
		Body: file,
		ContentType: contentType,
		ChecksumAlgorithm: 'SHA256'
	});
	return await s3
		.send(command)
		.then((response) => {
			const resCode = response.$metadata.httpStatusCode;
			const isSuccessUpload = resCode != undefined && 200 <= resCode && resCode < 300;
			const checksum = response.ChecksumSHA256 ?? '';
			return { isSuccessUpload, checksum, error: undefined };
		})
		.catch((error: Error) => {
			console.error(error);
			return { isSuccessUpload: false, checksum: '', error };
		});
}

export async function deleteFiles(region: string, bucketName: string, filePrefix: string) {
	const s3 = createStorageClient(region);

	// S3 isn't support directory-delete
	// Search by prefix and delete matched objects
	const listCommand = new ListObjectsV2Command({
		Bucket: bucketName,
		Prefix: filePrefix
	});
	const { list, error: listError } = await s3
		.send(listCommand)
		.then((list) => {
			return { list: list?.Contents, error: undefined };
		})
		.catch((error: Error) => {
			console.error(error);
			return { list: undefined, error };
		});
	if (!list || listError) {
		return { isSuccessDelete: false, error: listError };
	}

	const deleteTargetKeys: string[] = [];
	list.forEach((object) => {
		if (!object.Key) {
			return;
		}
		const afterPrefix = object.Key.split(filePrefix).at(1);
		if (afterPrefix === '' || afterPrefix?.startsWith('/')) {
			deleteTargetKeys.push(object.Key);
		}
	});
	if (!deleteTargetKeys.length) {
		return { isSuccessDelete: true, error: undefined };
	}

	const deleteCommand = new DeleteObjectsCommand({
		Bucket: bucketName,
		Delete: {
			Objects: deleteTargetKeys.map((key) => ({ Key: key }))
		}
	});
	return await s3
		.send(deleteCommand)
		.then((response) => {
			const resCode = response.$metadata.httpStatusCode;
			const isSuccessDelete = resCode != undefined && 200 <= resCode && resCode < 300;
			return { isSuccessDelete, error: undefined };
		})
		.catch((error: Error) => {
			console.error(error);
			return { isSuccessDelete: false, error };
		});
}
