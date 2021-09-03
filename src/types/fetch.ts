export type RequestConfig = {
  url: string

  /**
   * Number of times to retry the remote call if it fails.
   */
  retry?: number

  /**
   *
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API | Fetch API}
   */
  headers?: Record<string, any>

  method?: string

  data?: any

  params?: Record<string, any>
  requestId?: string

  responseType?: 'json' | 'text' | 'arraybuffer' | 'blob'

  credentials?: RequestCredentials

  /**
   * @deprecated withCredentials is deprecated in favor of credentials
   */
  withCredentials?: boolean
}

export interface FetchResponse<T = any> {
  data: T
  readonly status: number
  readonly statusText: string
  readonly ok: boolean
  readonly headers: Headers
  readonly redirected: boolean
  readonly type: ResponseType
  readonly url: string
  readonly config: RequestConfig
}

export interface FetchWorkEntry {
  id: string
  options: RequestConfig
}

export interface FetchErrorDataProps {
  message?: string
  status?: string
  error?: string | any
}

export interface FetchError<T extends FetchErrorDataProps = any> {
  status: number
  statusText?: string
  data: T
  cancelled?: boolean
  isHandled?: boolean
  config: RequestConfig
}

export enum DataQueryErrorType {
  Cancelled = 'cancelled',
  Timeout = 'timeout',
  Unknown = 'unknown',
}
