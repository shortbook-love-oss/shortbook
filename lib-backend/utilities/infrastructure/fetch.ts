import https from 'https';

interface FechJsonSuccess<T> {
	data: T[];
	contentType: string;
	error?: never;
}
interface FechJsonError {
	data?: never;
	contentType?: never;
	error: Error;
}

export function fetchGet<T>(url: string | URL, expectContentType: string) {
	return fetchBase<T>(url, 'GET', undefined, expectContentType);
}

export function fetchByJson<T>(url: string | URL, body: Record<string, any>) {
	return fetchBase<T>(url, 'POST', body, 'application/json');
}

async function fetchBase<T>(
	url: string | URL,
	method: string,
	body: Record<string, any> | undefined,
	expectContentType: string
): Promise<FechJsonSuccess<T> | FechJsonError> {
	let contentType = '';

	const data: T[] | Error = await new Promise((resolve, reject) => {
		const dataChunks: T[] = [];
		const reqHeader: Record<string, string> = {
			'user-agent': 'ShortBook Paid-Article Writing Platform'
		};
		if (expectContentType) {
			reqHeader['content-type'] = expectContentType;
		}
		const req = https.request(
			url,
			{
				method,
				headers: reqHeader
			},
			(res) => {
				const rawContentType = res.headers['content-type'];
				if (rawContentType) {
					contentType = rawContentType.replace(/[^\w+/.-].*/, '');
				}
				res.on('data', (chunk: T) => {
					dataChunks.push(chunk);
				});
				res.on('end', () => {
					resolve(dataChunks);
				});
			}
		);
		req.on('error', (error: Error) => {
			console.error(
				`Error in fetchData, reason: ${error.message}, url: ${url}, body: ${JSON.stringify(body)}`
			);
			reject(error);
		});
		if (body) {
			req.write(JSON.stringify(body));
		}
		req.end();
	});

	if (data instanceof Error) {
		return { error: data };
	}
	return { data, contentType };
}
