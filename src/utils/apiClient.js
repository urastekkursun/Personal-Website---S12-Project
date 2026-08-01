import { env } from "./env";

/**
 * Dil değişimi bildirimi için minik bir istemci.
 *
 * Eskiden axios kullanıyordu; axios bundle'ın %16'sını (16.5 kB gzip)
 * kaplıyordu ve kullanılan tek özelliği "timeout'lu POST" idi. `fetch` +
 * `AbortSignal.timeout()` aynı işi sıfır bağımlılıkla yapıyor.
 */
export class HttpError extends Error {
  constructor(status, statusText) {
    super(`HTTP ${status} ${statusText}`);
    this.name = "HttpError";
    this.status = status;
  }
}

export function isTimeoutError(error) {
  // AbortSignal.timeout() zaman aşımında TimeoutError adıyla reddediyor.
  return error?.name === "TimeoutError";
}

export async function postJson(path, body) {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(env.apiKey ? { "x-api-key": env.apiKey } : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(env.apiTimeoutMs),
  });

  // fetch, axios'un aksine 4xx/5xx'te reddetmez — kendimiz fırlatıyoruz.
  if (!response.ok) {
    throw new HttpError(response.status, response.statusText);
  }

  return response;
}
