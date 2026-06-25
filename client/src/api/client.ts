const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type QueryParams = Record<string, string | number | undefined>

/** Thrown on a non-2xx response; carries the HTTP status so callers can branch (e.g. on 409). */
export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function errorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json()
    if (body && typeof body.error === 'string') {
      return body.error
    }
  } catch {
    // response body wasn't JSON; use the fallback below
  }
  return fallback
}

async function throwForResponse(response: Response, fallback: string): Promise<never> {
  throw new ApiError(await errorMessage(response, fallback), response.status)
}

/** Tiny fetch wrapper: GET against the API, with JSON headers and a clear error on non-2xx. */
export async function get<T>(path: string, params?: QueryParams): Promise<T> {
  const url = new URL(path, API_URL)

  for (const [key, value] of Object.entries(params ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
  })

  if (!response.ok) {
    await throwForResponse(response, `GET ${path} failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

/** Tiny fetch wrapper: POST against the API with a JSON body; throws the server's error message on non-2xx. */
export async function post<T>(path: string, body: unknown): Promise<T> {
  const url = new URL(path, API_URL)

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    await throwForResponse(response, `POST ${path} failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

/** Tiny fetch wrapper: PATCH against the API with a JSON body; throws the server's error message on non-2xx. */
export async function patch<T>(path: string, body: unknown): Promise<T> {
  const url = new URL(path, API_URL)

  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    await throwForResponse(response, `PATCH ${path} failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}
