/**
 * Extended request options that include standard fetch RequestInit options
 * plus additional options specific to this API client.
 *
 * @property {Record<string, string>} [params] - URL query parameters to append to the request
 */
type RequestOptions = RequestInit & {
  params?: Record<string, string>;
};

/**
 * API client module that provides a typed interface for making HTTP requests
 * to the backend API using the native fetch API. The client handles common
 * concerns like error handling, authentication redirection, and request formatting.
 *
 * @example
 * // Basic GET Request
 * const users = await api.get<User[]>('/users');
 *
 * @example
 * // POST Request with Data
 * const newUser = await api.post<CreateUserResponse>('/users', userData);
 */
export const api = {
  /**
   * Make a GET request to the specified endpoint
   */
  get: <T>(endpoint: string, options?: RequestOptions) => client<T>(endpoint, { ...options, method: "GET" }),

  /**
   * Make a POST request to the specified endpoint
   */
  post: <T>(endpoint: string, data?: unknown, options?: RequestOptions) => {
    const contentType = (options?.headers as Record<string, string> | undefined)?.["Content-Type"];
    const isFormEncoded = contentType === "application/x-www-form-urlencoded";

    return client<T>(endpoint, {
      ...options,
      method: "POST",
      body: data
        ? isFormEncoded
          ? data instanceof URLSearchParams
            ? data
            : new URLSearchParams(data as Record<string, string>)
          : JSON.stringify(data)
        : undefined,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
  },

  /**
   * Make a PUT request to the specified endpoint
   */
  put: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    client<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
      headers: { "Content-Type": "application/json", ...options?.headers },
    }),

  /**
   * Make a PATCH request to the specified endpoint
   */
  patch: <T>(endpoint: string, data?: unknown, options?: RequestOptions) =>
    client<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
      headers: { "Content-Type": "application/json", ...options?.headers },
    }),

  /**
   * Make a DELETE request to the specified endpoint
   */
  delete: <T>(endpoint: string, options?: RequestOptions) => client<T>(endpoint, { ...options, method: "DELETE" }),
};

/**
 * Core client function that handles API requests with proper error handling
 *
 * @template T - The expected return type of the API request
 * @param {string} endpoint - The API endpoint to call (without the base URL)
 * @param {RequestOptions} options - Options for the fetch request
 * @returns {Promise<T>} - Promise resolving to the typed API response
 * @throws {Error} - Throws an error if the request fails
 */
async function client<T>(endpoint: string, { params, ...customConfig }: RequestOptions = {}): Promise<T> {
  const url = buildUrl(endpoint, params);
  const config = buildRequestConfig(customConfig);

  const response = await fetch(`/${url}`, config);
  return handleResponse<T>(response);
}

/**
 * Builds a complete URL with query parameters
 * Handles endpoints with or without leading slashes
 */
function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const normalizedEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  const queryString = params ? `?${new URLSearchParams(params).toString()}` : "";
  return `api/${normalizedEndpoint}${queryString}`;
}

/**
 * Builds request configuration with default headers and credentials
 */
function buildRequestConfig(customConfig: RequestInit): RequestInit {
  return {
    ...customConfig,
    headers: {
      Accept: "application/json",
      ...customConfig.headers,
    },
    credentials: "include",
  };
}

/**
 * Handles API response parsing and error checking
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("Content-Type") ?? "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    const message = (data as { message?: string })?.message || response.statusText;
    throw new Error(message);
  }

  return data as T;
}
