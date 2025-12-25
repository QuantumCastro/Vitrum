import Axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";

const resolveBaseUrl = (): string => {
  if (typeof window !== "undefined") {
    const fromWindow = (window as unknown as { __API_BASE_URL?: string }).__API_BASE_URL;
    if (fromWindow) return fromWindow;
  }
  if (typeof process !== "undefined" && process.env.PUBLIC_API_BASE_URL) {
    return process.env.PUBLIC_API_BASE_URL;
  }
  // Default host for dev; OpenAPI paths already include the /api prefix
  return "http://localhost:8000";
};

const BASE_URL = resolveBaseUrl();

export const AXIOS_INSTANCE = Axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

AXIOS_INSTANCE.interceptors.request.use((config) => {
  const token = typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

AXIOS_INSTANCE.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const maybeResponse = (error as { response?: { status?: number } })?.response;
    if (maybeResponse?.status === 401 && typeof localStorage !== "undefined") {
      localStorage.removeItem("token");
    }
    return Promise.reject(error instanceof Error ? error : new Error("Request failed"));
  },
);

type PromiseWithCancel<T> = Promise<T> & {
  cancel: () => void;
};

export const customInstance = <T>(
  config: AxiosRequestConfig,
  options?: AxiosRequestConfig,
): PromiseWithCancel<T> => {
  const source = Axios.CancelToken.source();

  const promise = AXIOS_INSTANCE({
    ...config,
    ...options,
    cancelToken: source.token,
  }).then(({ data }: AxiosResponse<T>) => data) as PromiseWithCancel<T>;

  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};

export type ErrorType<Error> = Error;
