const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type QueryParams = Record<string, string | number | undefined>

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
    throw new Error(await errorMessage(response, `GET ${path} failed: ${response.status} ${response.statusText}`))
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
    throw new Error(await errorMessage(response, `PATCH ${path} failed: ${response.status} ${response.statusText}`))
  }

  return response.json() as Promise<T>
}
