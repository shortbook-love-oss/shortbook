import https from "https";

interface FechJsonSuccess<T> {
  data: T[];
  errorMessage?: never;
}
interface FechJsonError {
  data?: never;
  errorMessage: string;
}

export async function fetchByJson<T extends unknown>(url: string, body: Record<string, any>): Promise<FechJsonSuccess<T> | FechJsonError> {
  let errorMessage = '';
  const data: T[] | null = await new Promise((resolve, reject) => {
    const dataChunks: T[] = [];
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'user-agent': 'ShortBook Paid-Article Writing Platform'
      }
    }, res => {
      res.on('data', (chunk: T) => {
        dataChunks.push(chunk);
      });
      res.on('end', () => {
        resolve(dataChunks);
      });
    });
    req.on('error', (error: Error) => {
      console.error(`Error in image deliver API, reason: ${error.message}, url: ${url}, body: ${JSON.stringify(body)}`);
      errorMessage = error.message;
      reject(null);
    });
    req.write(JSON.stringify(body));
    req.end();
  });

  if (!data || errorMessage) {
    return { errorMessage };
  }
  return { data };
}