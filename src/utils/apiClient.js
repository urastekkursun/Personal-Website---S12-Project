import { create } from "axios";
import { env } from "./env";

const api = create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeoutMs,
  headers: env.apiKey ? { "x-api-key": env.apiKey } : {},
});

export default api;
