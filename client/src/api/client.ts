const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type QueryParams = Record<string, string | number | undefined>

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
    throw new Error(`GET ${path} failed: ${response.status} ${response.statusText}`)
  }

  return response.json() as Promise<T>
}
