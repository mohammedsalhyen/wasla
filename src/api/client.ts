import Cookies from 'js-cookie'

export interface Envelope<T> { succeeded: boolean; statusCode: number; message: string; errors: string[]; data: T }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Rec = Record<string, any>
export interface Paged<T = Rec> { items: T[]; page: number; pageSize: number; totalCount: number; totalPages: number; hasNext: boolean; hasPrevious: boolean }
/** Lists may be paged or plain arrays depending on the endpoint. */
export const asItems = <T = Rec>(d: unknown): T[] => (Array.isArray(d) ? d : (d as Paged<T> | undefined)?.items ?? [])

export class ApiError extends Error {
    status: number
    errors: string[]
    constructor(status: number, message: string, errors: string[] = []) {
        super(message)
        this.status = status
        this.errors = errors
    }
}

/** i18n key for an error, used by thunks (rejectWithValue) and components (t(key)). */
export const errKey = (e: unknown) => (e instanceof ApiError ? `err-${[400, 401, 403, 404, 409, 410, 429].includes(e.status) ? e.status : 500}` : 'err-network')

type Opts = { method?: string; body?: unknown; form?: FormData; query?: Record<string, unknown> }

export const clearAuthCookies = () => { Cookies.remove('token'); Cookies.remove('role') }

export async function api<T = Rec>(path: string, { method = 'GET', body, form, query }: Opts = {}): Promise<T> {
    const qs = query
        ? new URLSearchParams(Object.entries(query).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => [k, String(v)])).toString()
        : ''
    const headers: Record<string, string> = {}
    const token = Cookies.get('token')
    if (token) headers.Authorization = `Bearer ${token}`
    if (body !== undefined) headers['Content-Type'] = 'application/json'

    const res = await fetch(qs ? `${path}?${qs}` : path, { method, headers, body: form ?? (body !== undefined ? JSON.stringify(body) : undefined) })
    let env: Envelope<T> | null = null
    try { env = await res.json() } catch { /* non-JSON body */ }

    if (res.status === 401) {
        clearAuthCookies()
        if (!location.pathname.startsWith('/login') && !location.pathname.startsWith('/gift')) location.assign('/login')
    }
    if (!res.ok || (env && !env.succeeded)) throw new ApiError(res.status, env?.message ?? res.statusText, env?.errors ?? [])
    return env?.data as T
}

/** Private files need the JWT, so fetch as a blob and open it. */
export const fetchBlobUrl = async (path: string) => {
    const res = await fetch(path, { headers: { Authorization: `Bearer ${Cookies.get('token')}` } })
    if (!res.ok) throw new Error('file')
    return URL.createObjectURL(await res.blob())
}
export const openFile = async (path: string) => { window.open(await fetchBlobUrl(path), '_blank') }
